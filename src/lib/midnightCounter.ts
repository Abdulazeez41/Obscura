import * as ledger from "@midnight-ntwrk/ledger-v8";
import { fromHex, toHex, CostModel } from "@midnight-ntwrk/compact-runtime";
import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";
import { createCircuitCallTxInterface } from "@midnight-ntwrk/midnight-js-contracts";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { dappConnectorProofProvider } from "@midnight-ntwrk/midnight-js-dapp-connector-proof-provider";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";

import * as Counter from "../../managed/counter/contract/index.js";

const CONTRACT_ADDRESS =
  "a46329618ce28a45479b5d0070874da5c9e61f53c67f59c576247410477a1dff";

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

const decodedContractAddress = ledger.decodeContractAddress(
  hexToBytes(CONTRACT_ADDRESS),
);

const PRIVATE_STATE_ID = "obscura-counter-private-state";

const privateStates = new Map<string, unknown>();
const signingKeys = new Map<string, unknown>();

const privateStateProvider = {
  get: async (id: string) => privateStates.get(id) ?? null,
  set: async (id: string, value: unknown) => {
    privateStates.set(id, value);
  },
  remove: async (id: string) => {
    privateStates.delete(id);
  },
  clear: async () => {
    privateStates.clear();
  },
  setContractAddress: () => undefined,
  getSigningKey: async (address: string) => signingKeys.get(address) ?? null,
  setSigningKey: async (address: string, key: unknown) => {
    signingKeys.set(address, key);
  },
  removeSigningKey: async (address: string) => {
    signingKeys.delete(address);
  },
  clearSigningKeys: async () => {
    signingKeys.clear();
  },
};

const compiledContract = CompiledContract.make(
  "counter",
  Counter.Contract,
).pipe(
  CompiledContract.withWitnesses({
    // This value stays in the local witness/proof transcript.
    secret_increment: (context: { privateState: Record<string, never> }) => [
      context.privateState,
      1n,
    ],
  }),
  CompiledContract.withCompiledFileAssets(window.location.origin),
);

export async function incrementCounter(connectedApi: ConnectedAPI) {
  const [configuration, shielded] = await Promise.all([
    connectedApi.getConfiguration(),
    connectedApi.getShieldedAddresses(),
  ]);

  const zkConfigProvider = new FetchZkConfigProvider(
    window.location.origin,
    fetch.bind(window),
  );

  const proofProvider =
    typeof connectedApi.getProvingProvider === "function"
      ? await dappConnectorProofProvider(
          connectedApi as any,
          zkConfigProvider,
          CostModel.initialCostModel(),
        )
      : httpClientProofProvider(
          configuration.proverServerUri ?? "http://localhost:6300",
          zkConfigProvider,
        );

  const walletProvider = {
    getCoinPublicKey: () =>
      ledger.decodeCoinPublicKey(shielded.shieldedCoinPublicKey),

    getEncryptionPublicKey: () =>
      shielded.shieldedEncryptionPublicKey as unknown as ledger.EncPublicKey,

    async balanceTx(
      tx: ledger.Transaction<
        ledger.SignatureEnabled,
        ledger.Proof,
        ledger.PreBinding
      >,
    ) {
      const response = await connectedApi.balanceUnsealedTransaction(
        toHex(tx.serialize()),
        {},
      );

      return ledger.Transaction.deserialize<
        ledger.SignatureEnabled,
        ledger.Proof,
        ledger.Binding
      >("signature", "proof", "binding", fromHex(response.tx));
    },
  };

  const midnightProvider = {
    async submitTx(tx: ledger.FinalizedTransaction) {
      await connectedApi.submitTransaction(toHex(tx.serialize()));
      return tx.identifiers()[0];
    },
  };

  const providers = {
    privateStateProvider,
    publicDataProvider: indexerPublicDataProvider(
      configuration.indexerUri,
      configuration.indexerWsUri,
    ),
    zkConfigProvider,
    proofProvider,
    walletProvider,
    midnightProvider,
  };

  if (!privateStates.has(PRIVATE_STATE_ID)) {
    privateStates.set(PRIVATE_STATE_ID, {});
  }

  const callTx = createCircuitCallTxInterface(
    providers as any,
    compiledContract as any,
    decodedContractAddress,
    PRIVATE_STATE_ID,
  );

  return callTx.increment();
}
