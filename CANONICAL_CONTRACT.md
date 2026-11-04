# handles-shared-components canonical contract

I am the shared React component library (`@koralabs/handles-shared-components`) used by handle.me and marketplace.handle.me, with a framework-free CIP-30 wallet connector (`src/helpers/walletConnector.ts`) also used by merch.handle.me. I show wallet and Handle data; the user's wallet signs.

1. **The wallet connector never signs or submits.** It only discovers wallets, calls the wallet's own `enable`, and reads network id, change address and reward address.
2. **Wallet data is returned raw and unaltered.** Addresses stay as the wallet's hex; a missing wallet throws rather than returning a fake connection.
3. **Extension requests pass through exactly as given.** `enableWallet` forwards `extensions` unchanged and adds none.
4. **The Handle image is what `@koralabs/handle-svg` renders** for the given handle and options; `SvgHandle` adds no text, colour or image, and only accepts strings from that package (it injects them as HTML).
5. **Components hold no chain logic.** Correctness of a displayed handle or address is the calling app's job.
