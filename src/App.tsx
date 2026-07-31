import { WalletConnect } from "./components/WalletConnect";
import { CircuitCall } from "./components/CircuitCall";
import { MidnightProvider } from "./hooks/useMidnight";

export default function App() {
  return (
    <main
      style={{
        maxWidth: 800,
        margin: "40px auto",
        padding: 20,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>Obscura - Privacy Counter</h1>
      <MidnightProvider>
        <WalletConnect />
        <CircuitCall />
      </MidnightProvider>
    </main>
  );
}
