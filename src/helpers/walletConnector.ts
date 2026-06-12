// handle.me#494 — framework-agnostic CIP-30 wallet connector primitives, shared across
// handle.me + marketplace.handle.me (React) and merch.handle.me (Lit). Deliberately has NO
// React/Lit and NO cardano-address dependency: it returns raw CIP-30 values; each app applies
// its own hex->bech32 conversion + balance decoding (which stays app-specific).

export interface AvailableWallet {
    key: string;
    name: string;
    icon: string;
}

/** CIP-30 `enable` options. `extensions` requests optional wallet extensions
 *  (e.g. CIP-95 governance, CIP-103) — the wallet only lights up an extension's
 *  API surface when the dApp asks for it here. Passing nothing enables plain CIP-30. */
export interface Cip30EnableOptions {
    extensions?: { cip: number }[];
}

export interface Cip30WalletStub {
    icon?: string;
    name?: string;
    apiVersion?: string;
    enable?: (options?: Cip30EnableOptions) => Promise<Cip30Api>;
}

export interface Cip30Api {
    getNetworkId: () => Promise<number>;
    getChangeAddress: () => Promise<string>;
    getRewardAddresses: () => Promise<string[]>;
    getUtxos: () => Promise<string[] | undefined>;
    getBalance: () => Promise<string>;
    signTx: (tx: string, partialSign?: boolean) => Promise<string>;
    submitTx: (tx: string) => Promise<string>;
}

export interface WalletConnection {
    walletKey: string;
    walletIcon: string;
    networkId: number;
    /** raw CIP-30 change address (hex CBOR) — convert to bech32 in the consuming app */
    changeAddressHex: string;
    /** raw CIP-30 first reward (stake) address (hex CBOR) — convert in the consuming app */
    rewardAddressHex: string;
}

type CardanoNamespace = Record<string, Cip30WalletStub> | null | undefined;

// Discover injected CIP-30 wallets from `window.cardano` — entries that expose `enable`.
export const listAvailableWallets = (cardano: CardanoNamespace): AvailableWallet[] => {
    if (!cardano) return [];
    return Object.keys(cardano)
        .filter((key) => typeof cardano[key]?.enable === 'function')
        .map((key) => ({ key, name: cardano[key]?.name ?? key, icon: cardano[key]?.icon ?? '' }))
        .sort((a, b) => a.name.localeCompare(b.name));
};

// Enable a wallet by key, returning its CIP-30 API. Throws if the wallet isn't injected.
// `options.extensions` is passed straight through to the wallet's `enable` so callers can
// request CIP-95 (governance/DRep), CIP-103, etc. — drop the arg for plain CIP-30.
export const enableWallet = async (
    cardano: CardanoNamespace,
    walletKey: string,
    options?: Cip30EnableOptions
): Promise<Cip30Api> => {
    const wallet = cardano?.[walletKey];
    if (typeof wallet?.enable !== 'function') {
        throw new Error(`Wallet "${walletKey}" is not available`);
    }
    return wallet.enable(options);
};

// Build the normalized (raw CIP-30) connection payload from an enabled API.
export const getWalletConnection = async (
    api: Cip30Api,
    walletKey: string,
    walletIcon: string
): Promise<WalletConnection> => {
    const [networkId, changeAddressHex, rewardAddresses] = await Promise.all([
        api.getNetworkId(),
        api.getChangeAddress(),
        api.getRewardAddresses()
    ]);
    return { walletKey, walletIcon, networkId, changeAddressHex, rewardAddressHex: rewardAddresses[0] ?? '' };
};
