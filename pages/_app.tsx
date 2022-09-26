import "../styles/globals.css"
import type { AppProps } from "next/app"
import "@rainbow-me/rainbowkit/styles.css"
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { chain, configureChains, createClient, WagmiConfig } from "wagmi"
import { alchemyProvider } from "wagmi/providers/alchemy"
import { publicProvider } from "wagmi/providers/public"
import Layout from "components/Layout/Layout"

function MyApp({ Component, pageProps }: AppProps) {
  const { chains, provider } = configureChains(
    [chain.mainnet, chain.goerli],
    [alchemyProvider({ alchemyId: process.env.ALCHEMY_ID }), publicProvider()]
  )

  const { connectors } = getDefaultWallets({
    appName: "Haus Catalogue",
    chains,
  })

  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
  })

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default MyApp
