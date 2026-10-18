#!/usr/bin/env bash
set -euo pipefail
if ! /usr/bin/curl --fail --silent --max-time 10 http://127.0.0.1:3100/api/health/ | /usr/bin/python3 -c 'import sys,json; assert json.load(sys.stdin).get("status")=="ok"'; then
    /usr/bin/logger -t lago-healthcheck 'Health check failed; restarting lago.service'
    /usr/bin/systemctl try-restart lago.service
    exit 1
fi
