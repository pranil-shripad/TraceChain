import { useState } from 'react'
import useWallet from './hooks/useWallet'
import ProductDetail from './components/ProductDetail';

function App() {
  const { account, error, connectWallet } = useWallet();
  

  return (
    <>
      <button type="button" onClick={ connectWallet }>Connect Wallet</button>
      {account && (
        <p>
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </p>
        
      )}

      {error && (
        <p style={{color: "red"}}>
          { error }
        </p>
      )}
      <ProductDetail productId={1} />
    </>
  )
}

export default App
