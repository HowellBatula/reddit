import { useMemo } from "react"
import { BlogProvider } from "src/context/Blog"
import { Router } from "src/router"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import "./App.css"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets"

export const App = () => {
  const endpoint = "https://twilight-methodical-sky.solana-devnet.discover.quiknode.pro/7d464082b4e6eb653671abc14c117d05d0c6c47c/"
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  )
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <BlogProvider>
          <Router />
        </BlogProvider>
      </WalletProvider>
    </ConnectionProvider>

  )
}
