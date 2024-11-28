import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import {
  polygonMumbai,
  polygonZkEvmTestnet,
  arbitrumSepolia,
  arbitrumGoerli,
  scrollSepolia,
  scrollTestnet,
  mantleTestnet,
  celoAlfajores,
  baseGoerli,
  baseSepolia,
  xdcTestnet,
  lineaTestnet,
} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { ChakraProvider } from "@chakra-ui/react";

const { chains, publicClient } = configureChains(
  [
    polygonMumbai,
    polygonZkEvmTestnet,
    arbitrumSepolia,
    arbitrumGoerli,
    scrollSepolia,
    scrollTestnet,
    mantleTestnet,
    celoAlfajores,
    baseGoerli,
    baseSepolia,
    xdcTestnet,
    lineaTestnet,
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
}
