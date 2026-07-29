import React from 'react';
import { WalletConnect } from './components/WalletConnect';
import { CircuitCall } from './components/CircuitCall';

function App() {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '40px auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#333' }}>
        Obscura - Privacy Counter
      </h1>
      
      <WalletConnect />
      <CircuitCall />
    </div>
  );
}

export default App;
