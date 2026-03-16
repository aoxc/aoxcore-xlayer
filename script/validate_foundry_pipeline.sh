#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

warn() { echo "[WARN] $*" >&2; }
info() { echo "[INFO] $*"; }
ok() { echo "[OK] $*"; }

if ! command -v forge >/dev/null 2>&1; then
  warn "forge is not installed in this environment."
  exit 2
fi

# Optional dependency sanity: if submodule dirs exist but are empty, compilation will fail.
for dep in lib/forge-std lib/openzeppelin-contracts lib/openzeppelin-contracts-upgradeable; do
  if [ -d "$dep" ] && [ -z "$(find "$dep" -mindepth 1 -maxdepth 1 2>/dev/null)" ]; then
    warn "$dep exists but appears empty. Initialize submodules/dependencies before running build."
    exit 3
  fi
done

info "Running forge clean"
forge clean

info "Running forge fmt --check"
forge fmt --check

info "Running forge build --sizes"
forge build --sizes

info "Running forge test -vvv"
forge test -vvv

ok "Foundry validation pipeline completed successfully."
