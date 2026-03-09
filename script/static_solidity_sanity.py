#!/usr/bin/env python3
"""Static sanity checks for AOXCORE Solidity and script files.

Checks:
1) No merge-artifact tokens are present.
2) No duplicate function signatures exist within a file.
3) Basic brace balance sanity for Solidity sources.
"""

from __future__ import annotations

import re
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
TARGET_DIRS = [ROOT / "src", ROOT / "script", ROOT / "test"]
BANNED = ["<<<<<<<", ">>>>>>>", " develop", " codex/hello"]

FN_RE = re.compile(r"\bfunction\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)")
SCOPE_RE = re.compile(r"\b(contract|interface|library)\s+([A-Za-z_][A-Za-z0-9_]*)")


def iter_files():
    for base in TARGET_DIRS:
        if not base.exists():
            continue
        for path in base.rglob("*.sol"):
            yield path


def normalize_params(raw: str) -> str:
    parts = []
    for p in raw.split(","):
        p = p.strip()
        if not p:
            continue
        tokens = p.split()
        parts.append(tokens[0])
    return ",".join(parts)


def main() -> int:
    errors: list[str] = []

    for path in iter_files():
        rel = path.relative_to(ROOT)
        text = path.read_text(encoding="utf-8")

        for token in BANNED:
            if token in text:
                errors.append(f"{rel}: contains banned token {token!r}")

        brace = 0
        for c in text:
            if c == "{":
                brace += 1
            elif c == "}":
                brace -= 1
            if brace < 0:
                errors.append(f"{rel}: brace balance dropped below zero")
                break
        if brace != 0:
            errors.append(f"{rel}: brace balance is {brace}, expected 0")

        # Duplicate signature checks are enforced for contract scopes only.
        # Interface declarations may legitimately mirror function names that
        # are implemented later in the same file.
        scope = None
        seen_by_contract: dict[str, set[str]] = {}
        for line in text.splitlines():
            s = line.strip()
            scope_match = SCOPE_RE.search(s)
            if scope_match:
                scope = (scope_match.group(1), scope_match.group(2))

            fn_match = FN_RE.search(s)
            if not fn_match or scope is None:
                continue
            scope_kind, scope_name = scope
            if scope_kind != "contract":
                continue

            sig = f"{fn_match.group(1)}({normalize_params(fn_match.group(2))})"
            seen = seen_by_contract.setdefault(scope_name, set())
            if sig in seen:
                errors.append(f"{rel}: duplicate function signature in contract {scope_name}: {sig}")
            seen.add(sig)

    if errors:
        print("[FAIL] Static Solidity sanity checks failed:")
        for e in errors:
            print(f" - {e}")
        return 1

    print("[OK] Static Solidity sanity checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
