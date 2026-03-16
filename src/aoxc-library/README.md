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
