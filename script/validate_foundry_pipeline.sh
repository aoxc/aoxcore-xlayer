#!/usr/bin/env bash
set -euo pipefail

if ! command -v forge >/dev/null 2>&1; then
  echo "[WARN] forge is not installed in this environment." >&2
  exit 2
fi

forge clean
forge fmt --check
forge build
forge test -vvv

echo "[OK] Foundry pipeline completed successfully."
