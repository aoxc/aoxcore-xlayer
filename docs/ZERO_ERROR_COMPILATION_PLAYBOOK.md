# Zero-Error Compilation Playbook (Foundry)

## Objective
Establish a repeatable process to keep all contracts compiling cleanly and move toward a zero-warning policy for production branches.

## Baseline Commands

```bash
forge clean
forge build
forge test -vvv
forge fmt --check
```

## Recommended Hardening Pass

1. **Remove stale imports** and dead symbols.
2. **Standardize modifier style** (wrap logic in internal helpers where appropriate).
3. **Normalize naming conventions** to a consistent policy.
4. **Address type-cast safety warnings** with explicit checks/comments.
5. **Enforce checked ERC20 transfer semantics** in tests and scripts.

## CI Policy Suggestion

- Pull requests must pass:
  - Build
  - Test
  - Format check
- Production branches should include periodic lint/security sweeps.

## Practical Constraint

If Foundry is unavailable in a given environment, treat compilation status as **unverified** and run the commands above in a Foundry-enabled CI runner or developer machine before release.
