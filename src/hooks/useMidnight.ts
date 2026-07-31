import { useState, useEffect } from "react";

export interface WalletInfo {
  name: string;
  id: string;
  api: any;
}

export function useMidnight() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);

  useEffect(() => {
    // Scan for available wallets after a short delay to ensure extensions have injected
    const timer = setTimeout(() => {
      const cardano = (window as any).cardano;
      if (cardano) {
        const wallets: WalletInfo[] = [];
        // Check common wallet IDs (add more as needed)
        const walletIds = [
          "lace",
          "eternl",
          "nami",
          "oneam",
          "gerowallet",
          "begin",
        ];

        walletIds.forEach((id) => {
          if (cardano[id]) {
            wallets.push({
              name: cardano[id].name || id.toUpperCase(),
              id: id,
              api: cardano[id],
            });
          }
        });
        setAvailableWallets(wallets);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const connectWallet = async (walletId: string) => {
    try {
      setError(null);
      const cardano = (window as any).cardano;

      if (!cardano || !cardano[walletId]) {
        throw new Error(
          `${walletId} wallet not found. Please install the extension.`,
        );
      }

      console.log(`🔵 [DEBUG] Attempting to enable ${walletId} API...`);
      const api = await cardano[walletId].enable();
      console.log(`🔵 [DEBUG] ${walletId} API enabled successfully`);

      const addresses = await api.getUsedAddresses();
      console.log(`🔵 [DEBUG] Addresses found:`, addresses);

      if (addresses && addresses.length > 0) {
        setWalletAddress(addresses[0]);
        setIsConnected(true);
        console.log(`🟢 [DEBUG] Wallet connected successfully!`);
      } else {
        throw new Error(
          "No addresses found. Please ensure your wallet is initialized and funded.",
        );
      }
    } catch (err: any) {
      console.error(`🔴 [DEBUG] ${walletId} connection failed:`, err);
      setError(err.message || "Failed to connect wallet");
      setIsConnected(false);
    }
  };

  const disconnectWallet = () => {
    console.log("🔵 [DEBUG] Disconnecting wallet...");
    setWalletAddress(null);
    setIsConnected(false);
    setError(null);
  };

  return {
    walletAddress,
    isConnected,
    error,
    availableWallets,
    connectWallet,
    disconnectWallet,
  };
}
