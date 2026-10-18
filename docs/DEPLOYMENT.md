# Lago production deployment

Production architecture: Cloudflare → Apache HTTPS virtual host → Node 22.23.3 on
127.0.0.1:3100. The production service is `lago`; its unprivileged runtime account is
`lago`. Apache/PHP/MariaDB configuration for unrelated sites is unchanged.

## Server layout and secrets

- `/srv/lago/releases/<git-sha>/`: immutable root-owned standalone releases,
  readable by the `lago` group; never put production secrets here.
- `/srv/lago/current`: atomic symlink to the active release.
- `/etc/lago/production.env`: root-owned 0600 systemd EnvironmentFile containing
  private Supabase service key, Sanity tokens, Stripe secrets and mail settings.
  Syntax is `NAME=value`, with systemd quoting when needed; no shell substitutions.
- `/var/cache/lago/<git-sha>`: writable by runtime account; each release's
  `dist/cache` points to its own cache directory. No source write permission is required.
- `/srv/lago/incoming`: dedicated deployment account's upload directory. The
  account must not own releases, current, systemd files or the release helper.
- `journalctl -u lago` for application logs; `journalctl -t lago-deploy` for release
  activation/rollback logs. Apache uses its domain-specific access/error logs.

The service must use `/srv/lago/current` as WorkingDirectory, execute Node on
`/srv/lago/current/server.js`, load the EnvironmentFile, bind HOSTNAME=127.0.0.1
and PORT=3100, use Restart=on-failure and be enabled for reboot. With systemd
ProtectSystem=strict allow writes only to `/var/cache/lago`.

## GitHub CI and production environment

`.github/workflows/ci.yml` validates pushes and pull requests with npm ci, lint,
unit tests, standalone production build and type-check. CI uses public placeholder
integration settings and never receives production private keys. It does not
prove real payment, database or OAuth connectivity; test those separately.

`.github/workflows/deploy.yml` is **manual only**, restricted to `main`. Before
activation, protect the GitHub `production` environment: allow only the production
branch, require an authorized reviewer, and prevent self-review where available.
Protect main with required CI checks. Fork PRs must never receive deployment
credentials. Change the branch guard if the authoritative repository uses another
branch. Automatic triggering may be added after this workflow is reviewed and a
manual deployment succeeds; no automatic deployment is currently enabled.

Set production environment **variables** (public values embedded into the browser
bundle):

- NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_API_VERSION
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- NEXT_PUBLIC_GA_MEASUREMENT_ID (optional)

APP_URL and SITE_URL are fixed to https://lago.lv in the production workflow.
Production private integration secrets stay in the server EnvironmentFile, not
GitHub artifacts. If a build later requires private CMS content, separately review
that requirement rather than adding all production secrets to CI.

Set production environment **secrets** via GitHub's encrypted settings:

- DEPLOY_HOST: VPS hostname/address
- DEPLOY_USER: dedicated nonroot deployment user
- DEPLOY_SSH_KEY: that user's restricted deployment private key
- DEPLOY_KNOWN_HOSTS: actual pinned SSH host-key lines obtained through a trusted
  server session; do not blindly trust `ssh-keyscan` over the deployment network.

## One-time administrator setup (not performed by CI)

Review and install `scripts/release-deploy.sh` as root-owned, non-writable
`/usr/local/sbin/lago-release`. It requires Python 3, tar, curl, flock, systemd and
Node compatible with the runner. Create the deployment account and authorize its
key only after explicit approval. Disable agent forwarding, TCP forwarding and
PTY for this key. Do not use a root SSH key, unrestricted sudo, or a production
self-hosted GitHub runner.

Grant only the reviewed fixed helper via a sudoers drop-in validated with visudo:

```sudoers
lago-deploy ALL=(root) NOPASSWD: /usr/local/sbin/lago-release
```

This command privilege is deliberately powerful enough to activate Lago code,
which runs as `lago`, and restart only `lago`. It must not permit editing the helper,
systemd unit, EnvironmentFile or any other root-owned path. The helper validates
its two hexadecimal arguments, upload checksum, archive paths/types/size, rejects
all archive links and environment files, and never executes uploaded code as root.
Do not grant `systemctl *`, shell, arbitrary tar, or arbitrary file-write sudo.
This document proposes the privilege; it does not grant it.

The parent `/srv/lago` and releases directory must remain root-owned. Only incoming
is deployment-user writable, with no group/other write access. Runtime `lago` must
not belong to the deployment group. The server helper is installed separately by an
administrator; changing its repository copy does not change the trusted helper.

## Release operation and rollback

A manual workflow rebuilds the selected main commit after validation, packages
standalone server plus `dist/static` and `public`, excludes all `.env*`, and uploads
it under its full Git SHA. The root helper snapshots and validates the upload,
creates an immutable version directory, atomically changes current, restarts the
service and probes `/api/health/` for up to a minute. Failed activation restores
and restarts the previous release, or stops the first failed release. Releases
are not deleted automatically. Keep at least the last known good release.

After activation the workflow also checks https://lago.lv/api/health/. A failed
public check reports failure but does not blindly roll back a healthy origin:
Cloudflare/DNS failure can affect every release. Investigate origin and proxy logs.
Health currently checks application responsiveness, not database/payment service
health. Complete login, customer isolation, Sanity content, Stripe test checkout,
signed webhook and asset smoke tests before accepting a production release.

Manual rollback by an authorized administrator:

```bash
# Choose an existing validated release; never use an arbitrary writable directory.
previous=/srv/lago/releases/FULL_KNOWN_GOOD_COMMIT_SHA
sudo test -f "$previous/server.js"
sudo ln -s "$previous" /srv/lago/.current-rollback
sudo mv -Tf /srv/lago/.current-rollback /srv/lago/current
sudo systemctl restart lago
curl --fail http://127.0.0.1:3100/api/health/
curl --fail https://lago.lv/api/health/
```

No database migrations are run by this pipeline. Review and back up data before
schema changes; an application rollback cannot undo destructive database changes.
Use distinct Supabase/Sanity/Stripe test resources for development and staging.
Do not edit production releases: develop on any PC from GitHub, submit reviewed
changes, pass CI and dispatch the protected deployment workflow.
