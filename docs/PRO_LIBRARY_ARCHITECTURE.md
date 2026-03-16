# AOXC Professional Library Architecture

## Executive Summary

This repository now exposes a **module-oriented library surface** through `src/aoxc-library`, designed for production consumers who need a stable and concise integration layer while preserving the existing implementation layout under `src/aoxcore-v2`.

The design goal is to provide:

1. **Stable consumer imports** (module aliases via Foundry remappings).
2. **Clear domain boundaries** (Core, Treasury, AI, Stake, Bridge, Access, Governance, Infrastructure).
3. **Low-risk evolution path** (thin module wrappers inheriting maintained implementation contracts).

---

## Library Contract Surface

The library surface is organized by domain:

- `src/aoxc-library/core/AoxcCoreModule.sol`
- `src/aoxc-library/treasury/AoxcVaultModule.sol`
- `src/aoxc-library/treasury/AoxcChangeModule.sol`
- `src/aoxc-library/ai/AoxcSentinelAIModule.sol`
- `src/aoxc-library/stake/AoxcCpexStakingModule.sol`
- `src/aoxc-library/bridge/AoxcBridgeVerifierModule.sol`
- `src/aoxc-library/access/AoxcGatewayModule.sol`
- `src/aoxc-library/governance/AoxcDaoManagerModule.sol`
- `src/aoxc-library/infra/AoxcAutoRepairModule.sol`

These are **entrypoint wrappers** that inherit battle-tested implementation contracts. Consumers can integrate module-by-module without coupling to deeper internal path conventions.

---

## Consumer Import Model

Foundry remappings in `foundry.toml` provide ergonomic aliases:

- `aoxc-lib-core/`
- `aoxc-lib-treasury/`
- `aoxc-lib-ai/`
- `aoxc-lib-stake/`
- `aoxc-lib-bridge/`
- `aoxc-lib-access/`
- `aoxc-lib-gov/`
- `aoxc-lib-infra/`

Example:

```solidity
import {AoxcVaultModule} from "aoxc-lib-treasury/AoxcVaultModule.sol";
import {AoxcSentinelAIModule} from "aoxc-lib-ai/AoxcSentinelAIModule.sol";
```

---

## Production-Grade Integration Guidance

### 1) Version pinning
Pin the exact commit hash/tag when consuming this library in production.

### 2) Upgrade discipline
If wrappers remain inheritance-only, implementation behavior remains canonical and auditable.

### 3) Change control
Treat `src/aoxc-library` as an externally consumed API layer:
- Avoid breaking rename/move operations without deprecation windows.
- Prefer additive evolution for new modules.

### 4) Security baseline
Before deployment:
- Run `forge build --sizes`.
- Run full `forge test -vvv`.
- Enforce lint + static analysis in CI.

---

## Roadmap (Advanced)

1. Introduce semantic versioning for module aliases.
2. Publish machine-readable module manifests.
3. Add CI gates for build/test/lint formatting checks.
4. Optionally split modules into independent packages once dependency boundaries stabilize.
