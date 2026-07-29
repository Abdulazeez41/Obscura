import React from "react";
import { useMidnight } from "../hooks/useMidnight";

export function WalletConnect() {
  const { walletAddress, isConnected, error, connectWallet, disconnectWallet } =
    useMidnight();

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
        <button
          onClick={connectWallet}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Connect Lace Wallet
        </button>
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
