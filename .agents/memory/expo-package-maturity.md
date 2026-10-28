---
name: Expo package maturity gate
description: Handling Expo module installs blocked by the workspace registry's release-age policy.
---

When Expo selects a newly published native module patch and pnpm rejects it with `ERR_PNPM_NO_MATURE_MATCHING_VERSION`, do not bypass the registry release-age gate. Pin an earlier published patch from the same Expo SDK line and verify the target platform bundle.

**Why:** The registry may hold back fresh releases even after Expo's compatibility map recommends them.

**How to apply:** Check the Expo CLI's recommended version, choose a mature same-SDK patch if blocked, then typecheck and bundle the native platform before finishing.
