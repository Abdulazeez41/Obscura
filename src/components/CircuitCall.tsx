import { useState } from "react";
import { useMidnight } from "../hooks/useMidnight";
import { incrementCounter } from "../lib/midnightCounter";

export function CircuitCall() {
  const { isConnected, connectedApi } = useMidnight();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callIncrementCircuit = async () => {
    if (!connectedApi || !isConnected) {
      setError("Connect a Midnight wallet first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const tx = await incrementCounter(connectedApi);
      setResult(`Transaction submitted successfully. Tx: ${tx.public.txHash}`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to submit the increment transaction.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section style={{ padding: 20, border: "1px solid #333", borderRadius: 8 }}>
      <h2>Call Increment Circuit</h2>

      <p
        style={{
          padding: 12,
          borderRadius: 4,
          color: "#155724",
          background: "#d4edda",
          fontWeight: "bold",
        }}
      >
        🔒 Proved without revealing your input
      </p>

      <button
        type="button"
        onClick={callIncrementCircuit}
        disabled={!isConnected || isLoading}
      >
        {isLoading ? "Generating proof and submitting..." : "Increment Counter"}
      </button>

      {isLoading && <p>Generating the proof locally…</p>}
      {result && <p role="status">✅ {result}</p>}
      {error && <p role="alert">❌ {error}</p>}
    </section>
  );
}
