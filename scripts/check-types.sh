#!/bin/bash
# Preserve the compiler's exit status and diagnostics for local/CI callers.
set -euo pipefail

npx tsc --noEmit --pretty "$@"
