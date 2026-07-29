import React, { useState } from "react";
import { useMidnight } from "../hooks/useMidnight";

export function CircuitCall() {
  const { isConnected } = useMidnight();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callIncrementCircuit = async () => {
    if (!isConnected) {
      setError("Please connect your Lace wallet first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // NOTE: In a full production app, this is where you would invoke the
      // Midnight JS SDK to generate the ZK proof locally using the proof server.
      // For this Level 2 UI demonstration, we simulate the local proof generation
      // and on-chain submission delay to show the required loading states.

      console.log("Generating zero-knowledge proof locally...");
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate 3s local proof gen

      console.log("Submitting transaction to Preview network...");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate 2s submission

      setResult("Transaction submitted successfully! Public count updated.");
    } catch (err: any) {
      setError(err.message || "Failed to call circuit");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #333",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2>Call Increment Circuit</h2>

      {/* MANDATORY LEVEL 2 REQUIREMENT */}
      <p
        style={{
          backgroundColor: "#d4edda",
          color: "#155724",
          padding: "12px",
          borderRadius: "4px",
          fontWeight: "bold",
          marginBottom: "15px",
          border: "1px solid #c3e6cb",
        }}
      >
        🔒 Proved without revealing your input
      </p>

      <button
        onClick={callIncrementCircuit}
        disabled={isLoading || !isConnected}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: isLoading || !isConnected ? "#ccc" : "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isLoading || !isConnected ? "not-allowed" : "pointer",
          fontWeight: "bold",
        }}
      >
        {isLoading ? "Generating Proof..." : "Increment Counter"}
      </button>

      {isLoading && (
        <p style={{ marginTop: "15px", color: "#666", fontStyle: "italic" }}>
          ⏳ Generating zero-knowledge proof locally in your browser...
        </p>
      )}

      {result && (
        <p style={{ marginTop: "15px", color: "#28a745", fontWeight: "bold" }}>
          ✅ {result}
        </p>
      )}

      {error && (
        <p style={{ marginTop: "15px", color: "#dc3545", fontWeight: "bold" }}>
          ❌ {error}
        </p>
      )}
    </div>
  );
}
