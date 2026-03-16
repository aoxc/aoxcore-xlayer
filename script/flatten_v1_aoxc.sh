#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_FILE="$ROOT_DIR/flat/v1/AOXC.flattened.sol"

mkdir -p "$(dirname "$OUT_FILE")"

if ! command -v forge >/dev/null 2>&1; then
  echo "forge is not installed. Install Foundry then run this script again." >&2
  exit 1
fi

forge flatten "$ROOT_DIR/src/aoxcore-v1/AOXC.sol" > "$OUT_FILE"
echo "Flattened contract written to: $OUT_FILE"
