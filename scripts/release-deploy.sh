#!/usr/bin/env bash
# Install as root-owned /usr/local/sbin/lago-release after review.
set -euo pipefail
umask 027
[[ $EUID -eq 0 ]] || { echo 'Root-owned release helper required' >&2; exit 1; }
[[ $# -eq 2 && $1 =~ ^[a-f0-9]{40}$ && $2 =~ ^[a-f0-9]{64}$ ]] || exit 2
release=$1
expected=$2
exec 9>/run/lock/lago-release.lock
flock -n 9 || { echo 'Another deployment is running' >&2; exit 1; }
base=/srv/lago
source_archive="$base/incoming/$release.tar.gz"
target="$base/releases/$release"
[[ ! -e $target && ! -L $target ]]
install -d -o root -g lago -m 0750 "$base/releases"
work=$(mktemp -d "$base/releases/.prepare.XXXXXXXX")
cleanup() { rm -rf -- "$work"; }
trap cleanup EXIT
# Snapshot an untrusted upload using O_NOFOLLOW, verify and safely extract regular
# files/directories only. Never run code from an uploaded release as root.
python3 - "$source_archive" "$work" "$expected" <<'PY'
import hashlib, os, pathlib, shutil, stat, sys, tarfile
src, work, expected = sys.argv[1:]
fd = os.open(src, os.O_RDONLY | os.O_NOFOLLOW)
with os.fdopen(fd, 'rb') as incoming, open(work + '/archive.tgz', 'wb') as out:
    st = os.fstat(incoming.fileno())
    if not stat.S_ISREG(st.st_mode) or st.st_size > 1024**3:
        raise SystemExit('Invalid archive file')
    shutil.copyfileobj(incoming, out)
with open(work + '/archive.tgz', 'rb') as f:
    digest = hashlib.file_digest(f, 'sha256').hexdigest() if hasattr(hashlib, 'file_digest') else None
    if digest is None:
        f.seek(0); h = hashlib.sha256()
        for chunk in iter(lambda: f.read(1024*1024), b''): h.update(chunk)
        digest = h.hexdigest()
if digest != expected: raise SystemExit('SHA256 mismatch')
root = pathlib.Path(work) / 'app'
root.mkdir()
with tarfile.open(work + '/archive.tgz') as archive:
    members = archive.getmembers()
    if sum(m.size for m in members) > 2 * 1024**3 or len(members) > 100000:
        raise SystemExit('Archive exceeds release limits')
    for m in members:
        p = pathlib.PurePosixPath(m.name)
        if p.is_absolute() or '..' in p.parts or not (m.isdir() or m.isfile()):
            raise SystemExit('Unsafe archive entry')
        if any(part.startswith('.env') for part in p.parts):
            raise SystemExit('Environment files must not be packaged')
        dest = root.joinpath(*p.parts)
        if m.isdir(): dest.mkdir(parents=True, exist_ok=True)
        else:
            dest.parent.mkdir(parents=True, exist_ok=True)
            with archive.extractfile(m) as source, open(dest, 'xb') as out:
                shutil.copyfileobj(source, out)
            dest.chmod(0o640)
if not (root / 'server.js').is_file(): raise SystemExit('Missing standalone server')
PY
chown -R root:lago "$work/app"
find "$work/app" -type d -exec chmod 0750 {} +
install -d -o lago -g lago -m 0750 /var/cache/lago "/var/cache/lago/$release"
rm -rf -- "$work/app/dist/cache"
ln -s "/var/cache/lago/$release" "$work/app/dist/cache"
mv "$work/app" "$target"
previous=$(readlink -f "$base/current" || true)
[[ -z $previous || $previous == "$base/releases/"* ]] || { echo 'Unexpected current target' >&2; exit 1; }
activate() {
  ln -s "$1" "$base/.current-next"
  mv -Tf "$base/.current-next" "$base/current"
}
rollback() {
  echo "Release $release failed; rolling back" >&2
  logger -t lago-deploy "Release $release failed; rollback to $previous"
  if [[ -n $previous && -d $previous ]]; then
    activate "$previous"
    systemctl restart lago
  else
    systemctl stop lago
    rm -f "$base/current"
  fi
}
activate "$target"
if ! systemctl restart lago; then rollback; exit 1; fi
healthy=false
for attempt in {1..30}; do
  if curl --fail --silent --max-time 3 http://127.0.0.1:3100/api/health/ | python3 -c 'import json,sys; assert json.load(sys.stdin)["status"] == "ok"' 2>/dev/null; then
    healthy=true; break
  fi
  sleep 2
done
if [[ $healthy != true ]]; then rollback; exit 1; fi
logger -t lago-deploy "Activated release $release (previous: $previous)"
printf 'Activated release %s\n' "$release"
