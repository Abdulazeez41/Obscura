import { useState } from "react";

export function useMidnight() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    console.log("🔵 [DEBUG] Connect button was clicked!");

    try {
      setError(null);

      const cardano = (window as any).cardano;
      console.log("🔵 [DEBUG] window.cardano object:", cardano);

      if (!cardano) {
        throw new Error(
          "No Cardano wallet detected. Please install a wallet like Lace or Eternl.",
        );
      }

      if (!cardano.lace) {
        throw new Error(
          "Lace wallet not detected. Please ensure the Lace extension is installed, enabled, and the page is refreshed.",
        );
      }

      console.log("🔵 [DEBUG] Attempting to enable Lace API...");
      const api = await cardano.lace.enable();
      console.log("🔵 [DEBUG] Lace API enabled successfully:", api);

      const addresses = await api.getUsedAddresses();
      console.log("🔵 [DEBUG] Addresses found in wallet:", addresses);

      if (addresses && addresses.length > 0) {
        const hexAddress = addresses[0];
        setWalletAddress(hexAddress);
        setIsConnected(true);
        console.log("🟢 [DEBUG] Wallet connected successfully!");
      } else {
        throw new Error(
          "No addresses found. Please open your Lace wallet and ensure it is initialized/funded.",
        );
      }
    } catch (err: any) {
      console.error("🔴 [DEBUG] Wallet connection failed with error:", err);
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
    connectWallet,
    disconnectWallet,
  };
}
