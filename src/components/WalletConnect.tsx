import React from "react";
import { useMidnight } from "../hooks/useMidnight";

export function WalletConnect() {
  const {
    walletAddress,
    isConnected,
    error,
    availableWallets,
    connectWallet,
    disconnectWallet,
  } = useMidnight();

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #333",
        borderRadius: "8px",
        marginBottom: "20px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2>Wallet Connection</h2>

      {!isConnected ? (
        <div>
          {availableWallets.length === 0 ? (
            <p style={{ color: "#dc3545", fontWeight: "bold" }}>
              ⚠️ No Midnight-compatible wallets detected. Please install Lace,
              1AM, Eternl, or Nami.
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <p style={{ marginBottom: "5px", color: "#555" }}>
                Select a wallet to connect:
              </p>
              {availableWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => connectWallet(wallet.id)}
                  style={{
                    padding: "12px 24px",
                    fontSize: "16px",
                    cursor: "pointer",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#0056b3")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#007bff")
                  }
                >
                  🔗 Connect with {wallet.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <p>
            <strong>Connected Address:</strong>
          </p>
          <p
            style={{
              wordBreak: "break-all",
              fontSize: "14px",
              backgroundColor: "#e9ecef",
              padding: "8px",
              borderRadius: "4px",
            }}
          >
            {walletAddress}
          </p>
          <button
            onClick={disconnectWallet}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              marginTop: "10px",
              cursor: "pointer",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Disconnect
          </button>
        </div>
      )}

      {error && (
        <p style={{ color: "#dc3545", marginTop: "10px", fontWeight: "bold" }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
