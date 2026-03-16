# AOXC Library Surface

This folder exposes stable module-oriented entry contracts for consumers.

- core: `AoxcCoreModule`
- treasury: `AoxcVaultModule`, `AoxcChangeModule`
- ai: `AoxcSentinelAIModule`
- stake: `AoxcCpexStakingModule`
- bridge: `AoxcBridgeVerifierModule`
- access: `AoxcGatewayModule`
- governance: `AoxcDaoManagerModule`
- infra: `AoxcAutoRepairModule`

All module contracts currently inherit the maintained V2 implementation contracts.


## Constructor Notes

- `AoxcDaoManagerModule` constructor requires `(address registry_, address token_, uint256 lifespan_)` and forwards these to `AoxcDaoManager`.


## Approved Module Manifest

Machine-readable module catalog for external consumers:

- `src/aoxc-library/manifest/approved-modules.json`

Regenerate after wrapper/constructor changes:

```bash
python3 script/generate_library_manifest.py
```

Downstream chains/CLIs (e.g. aoxchain) should consume wrappers via this manifest only.
