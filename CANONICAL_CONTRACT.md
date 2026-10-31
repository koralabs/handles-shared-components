# handles-shared-components canonical contract

## Purpose and authority

I am the shared React component library (`@koralabs/handles-shared-components`) used by handle.me and marketplace.handle.me, with a framework-free CIP-30 wallet connector (`src/helpers/walletConnector.ts`) that merch.handle.me also uses. I show wallet and Handle data; the user's wallet signs. I am published to npm and Storybook to GitHub Pages by `.github/workflows/deploy.yml`.


This file and `.enclave` are the operator's gate: a PR that changes any path listed in `.enclave` and merges into `master` needs the operator's approval. Nothing here authorizes signing, spending, minting, burning or editing on-chain contracts or settings. Ecosystem rules (addresses correct 100% of the time, never double-mint, chain-accurate properties) are in the koralabs root `AGENTS.md`.

## Invariants (must never be violated)

1. **The wallet connector never signs or submits.** `listAvailableWallets`, `enableWallet` and `getWalletConnection` only discover wallets, call the wallet's own `enable`, and read network id, change address, reward address. `signTx`/`submitTx` appear only as types. Enforced in part by `test/helpers/walletConnector.test.ts` (no test asserts the absence of signing calls).
2. **Wallet data is returned raw and unaltered.** Addresses stay as the wallet's hex; each app converts them. A missing wallet throws rather than returning a fake connection. Enforced by `test/helpers/walletConnector.test.ts`, including the empty reward-address case.
3. **Extension requests are passed through exactly as given.** `enableWallet` forwards `extensions` unchanged to the wallet and adds none. Enforced by "enableWallet passes extension options".
4. **The Handle image shows what `@koralabs/handle-svg` renders for the given handle and options.** `SvgHandle` adds no text, colour or image of its own. Rendering tests exist under `test/components/`, but none pins `SvgHandle` output to the handle name.
5. **The published package is complete and built from `lib/`.** `build.sh` writes the publish manifest to `lib/package.json` and never rewrites the source `package.json`. Enforced by `test/publish/publish-package.test.ts`.
6. **Only a version bump publishes, and only from the deploy workflow.** The workflow skips a version already on npm and publishes with provenance. Workflow property; no test.
7. **No secrets in this repo.** Not enforced by a test.

## Boundaries and known limits

- `SvgHandle` injects SVG strings from `@koralabs/handle-svg` with `dangerouslySetInnerHTML`. It is safe only because that package builds the strings; it must never be given strings from another source.
- Components hold no chain logic. Whether a handle or address shown is correct is the calling app's job.
- Lint is not configured (`npm run lint` is a placeholder).

## Refactors needed to enforce this

- Add a test that `walletConnector` calls no method named `signTx`, `submitTx` or `signData` on the wallet (invariant 1).
- Add a test that `SvgHandle` renders the exact handle text it was given (invariant 4).
- Add a gate that no key or token string is committed (invariant 7), and a real lint step.
