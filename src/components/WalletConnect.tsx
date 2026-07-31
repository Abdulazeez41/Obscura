import { useMidnight } from "../hooks/useMidnight";

export function WalletConnect() {
  const {
    walletAddress,
    isConnected,
    error,
    availableWallets,
    connectWallet,
    disconnectWallet,
    refreshWallets,
  } = useMidnight();

  return (
    <section
      style={{
        padding: 20,
        border: "1px solid #333",
        borderRadius: 8,
        marginBottom: 20,
      }}
    >
      <h2>Wallet connection</h2>

      {!isConnected ? (
        <>
          {availableWallets.length === 0 ? (
            <>
              <p>
                No Midnight wallet detected. Install and unlock 1AM or Lace,
                then refresh this page.
              </p>
              <button type="button" onClick={refreshWallets}>
                Check again
              </button>
            </>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <p>Select a Midnight wallet:</p>
              {availableWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  type="button"
                  onClick={() => connectWallet(wallet.id)}
                >
                  Connect {wallet.name}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <p>
            <strong>Connected address:</strong> {walletAddress}
          </p>
          <button type="button" onClick={disconnectWallet}>
            Disconnect
          </button>
        </>
      )}

      {error && (
        <p role="alert" style={{ color: "#b42318" }}>
          {error}
        </p>
      )}
    </section>
  );
}
