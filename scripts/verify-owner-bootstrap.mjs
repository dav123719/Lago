// Tool-only dependency: install PGlite outside the repository, then pass its
// dist/index.js path. Creates in-memory databases only; no production access.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
if (!process.argv[2]) throw new Error('Pass the temporary PGlite dist/index.js path; see docs/performance/backend.md')
const { PGlite } = await import(pathToFileURL(resolve(process.argv[2])).href)
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const foundation = read('supabase/migrations/20261022170145_lago_account_system.sql')
const update = read('supabase/migrations/20261022193626_lock_owner_bootstrap.sql')
const regression = read('supabase/tests/owner_bootstrap.sql')
const accountRls = read('supabase/tests/account_rls.sql')
const fixture = `CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
CREATE SCHEMA auth;
CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, email_confirmed_at timestamptz, email_change text, raw_user_meta_data jsonb DEFAULT '{}'::jsonb);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
GRANT USAGE ON SCHEMA auth TO anon, authenticated;`
for (const patched of [false, true]) {
  const db = new PGlite()
  try {
    await db.exec(fixture)
    await db.exec(foundation)
    if (patched) { await db.exec(update); await db.exec(update) }
    let failedAsExpected = false
    try {
      await db.exec(regression)
    } catch (error) {
      if (patched || !error.message.includes('Consumed owner bootstrap replayed')) throw error
      failedAsExpected = true
    }
    if (!patched && !failedAsExpected) throw new Error('Original unsafe function unexpectedly passed')
    if (patched) {
      const { rows: [security] } = await db.query(`SELECT prosecdef, proconfig,
        has_function_privilege('anon', 'private.grant_verified_owner_admin()', 'EXECUTE') AS anon_execute,
        has_function_privilege('authenticated', 'private.grant_verified_owner_admin()', 'EXECUTE') AS authenticated_execute
        FROM pg_proc WHERE oid = 'private.grant_verified_owner_admin()'::regprocedure`)
      if (!security.prosecdef || !security.proconfig.includes('search_path=""') || security.anon_execute || security.authenticated_execute) throw new Error('Function security settings regressed')
      console.log('PASS: updated migration applies twice, regression assertions pass, definer/search_path/execution grants preserved')
      console.log((await db.query('select version()')).rows[0].version)
      const rlsResults = await db.exec(accountRls)
      const checks = rlsResults.flatMap(result => result.rows).filter(row => typeof row.passed === 'string')
      for (const check of checks) console.log(`PASS: ${check.passed}`)
      if (checks.length !== 7) throw new Error('Missing expected RLS assertion groups')
      console.log('PASS: 7 real-role RLS assertion groups, including 25 denied privileged operations')
    } else console.log('PASS: original SQL reproduces consumed-bootstrap replay defect')
  } finally { await db.close() }
}
