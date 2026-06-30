import assert from "node:assert/strict";
import test from "node:test";

import {
  enableWallet,
  getWalletConnection,
  listAvailableWallets,
  type Cip30Api,
} from "../../src/helpers/walletConnector.ts";

test("listAvailableWallets returns sorted wallets with enable functions", () => {
  const wallets = listAvailableWallets({
    nami: { name: "Nami", icon: "nami.svg", enable: async () => ({} as Cip30Api) },
    lace: { name: "Lace", enable: async () => ({} as Cip30Api) },
    metadataOnly: { name: "Metadata only" },
  });

  assert.deepEqual(wallets, [
    { key: "lace", name: "Lace", icon: "" },
    { key: "nami", name: "Nami", icon: "nami.svg" },
  ]);
});

test("listAvailableWallets handles missing cardano namespace", () => {
  assert.deepEqual(listAvailableWallets(undefined), []);
  assert.deepEqual(listAvailableWallets(null), []);
});

test("enableWallet passes extension options to the selected wallet", async () => {
  const api = {} as Cip30Api;
  const options = { extensions: [{ cip: 95 }] };
  let receivedOptions: unknown;

  const enabled = await enableWallet(
    {
      lace: {
        enable: async (enableOptions) => {
          receivedOptions = enableOptions;
          return api;
        },
      },
    },
    "lace",
    options
  );

  assert.equal(enabled, api);
  assert.equal(receivedOptions, options);
});

test("enableWallet rejects unavailable wallets", async () => {
  await assert.rejects(() => enableWallet({}, "missing"), /Wallet "missing" is not available/);
  await assert.rejects(
    () => enableWallet({ metadataOnly: { name: "Metadata only" } }, "metadataOnly"),
    /Wallet "metadataOnly" is not available/
  );
});

test("getWalletConnection builds the raw CIP-30 connection payload", async () => {
  const api: Cip30Api = {
    getNetworkId: async () => 1,
    getChangeAddress: async () => "change-address-hex",
    getRewardAddresses: async () => ["reward-address-hex"],
    getUtxos: async () => [],
    getBalance: async () => "0",
    signTx: async (tx) => tx,
    submitTx: async (tx) => tx,
  };

  assert.deepEqual(await getWalletConnection(api, "lace", "lace.svg"), {
    walletKey: "lace",
    walletIcon: "lace.svg",
    networkId: 1,
    changeAddressHex: "change-address-hex",
    rewardAddressHex: "reward-address-hex",
  });
});

test("getWalletConnection falls back to an empty reward address", async () => {
  const api: Cip30Api = {
    getNetworkId: async () => 0,
    getChangeAddress: async () => "change-address-hex",
    getRewardAddresses: async () => [],
    getUtxos: async () => undefined,
    getBalance: async () => "0",
    signTx: async (tx) => tx,
    submitTx: async (tx) => tx,
  };

  assert.equal((await getWalletConnection(api, "nami", "")).rewardAddressHex, "");
});
