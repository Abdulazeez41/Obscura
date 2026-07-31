import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import type {
  ConnectedAPI,
  InitialAPI,
} from "@midnight-ntwrk/dapp-connector-api";

type MidnightWindow = Window & {
  midnight?: Record<string, unknown>;
};

export interface WalletInfo {
  id: string;
  name: string;
  rdns?: string;
  apiVersion: string;
  api: InitialAPI;
}

const NETWORK_ID = import.meta.env.VITE_MIDNIGHT_NETWORK ?? "preview";

function isInitialApi(value: unknown): value is InitialAPI {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<InitialAPI>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.apiVersion === "string" &&
    typeof candidate.connect === "function"
  );
}

function discoverWallets(): WalletInfo[] {
  const injected = (window as MidnightWindow).midnight ?? {};

  return Object.entries(injected)
    .filter(([, api]): api is [string, InitialAPI] => isInitialApi(api))
    .map(([id, api]) => ({
      id,
      name: api.name,
      rdns: api.rdns,
      apiVersion: api.apiVersion,
      api,
    }));
}

function toErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  if (normalized.includes("reject") || normalized.includes("denied")) {
    return "Wallet connection was rejected.";
  }
  if (normalized.includes("network")) {
    return `This wallet is not connected to Midnight ${NETWORK_ID}. Switch networks in the wallet and try again.`;
  }
  return message || "Unable to connect to the selected wallet.";
}

function useMidnightState() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);
  const [connectedApi, setConnectedApi] = useState<ConnectedAPI | null>(null);

  const refreshWallets = useCallback(() => {
    setAvailableWallets(discoverWallets());
  }, []);

  useEffect(() => {
    refreshWallets();

    // Extensions may inject after the page has loaded. Poll briefly, then refresh
    // again when the user returns to the tab after installing or unlocking one.
    const interval = window.setInterval(refreshWallets, 250);
    const stopPolling = window.setTimeout(
      () => window.clearInterval(interval),
      5_000,
    );
    window.addEventListener("focus", refreshWallets);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(stopPolling);
      window.removeEventListener("focus", refreshWallets);
    };
  }, [refreshWallets]);

  const connectWallet = useCallback((walletId: string) => {
    // Do not await before `connect`: Lace requires this call to retain the
    // browser's click activation so its authorization window is not blocked.
    setError(null);
    const wallet = discoverWallets().find(({ id }) => id === walletId);
    if (!wallet) {
      setError(
        "Wallet not detected. Refresh the page after enabling the extension.",
      );
      return;
    }

    void (async () => {
      try {
        const api = await wallet.api.connect(NETWORK_ID);
        const status = await api.getConnectionStatus();
        if (status.status !== "connected") {
          throw new Error("Wallet is disconnected.");
        }

        const { unshieldedAddress } = await api.getUnshieldedAddress();
        setNetworkId(status.networkId);
        setConnectedApi(api);
        setWalletAddress(unshieldedAddress);
        setIsConnected(true);
      } catch (connectError) {
        setConnectedApi(null);
        setWalletAddress(null);
        setIsConnected(false);
        setError(toErrorMessage(connectError));
      }
    })();
  }, []);

  const disconnectWallet = useCallback(() => {
    // The connector has no universal disconnect method; this clears the DApp's
    // session without revoking the wallet extension's authorization.
    setConnectedApi(null);
    setWalletAddress(null);
    setIsConnected(false);
    setError(null);
  }, []);

  return {
    walletAddress,
    isConnected,
    error,
    availableWallets,
    connectedApi,
    connectWallet,
    disconnectWallet,
    refreshWallets,
  };
}

export type MidnightContextValue = ReturnType<typeof useMidnightState>;

const MidnightContext = createContext<MidnightContextValue | null>(null);

export function MidnightProvider({ children }: { children: ReactNode }) {
  const midnight = useMidnightState();
  return createElement(MidnightContext.Provider, { value: midnight }, children);
}

export function useMidnight(): MidnightContextValue {
  const midnight = useContext(MidnightContext);
  if (!midnight) {
    throw new Error("useMidnight must be used within MidnightProvider.");
  }
  return midnight;
}
