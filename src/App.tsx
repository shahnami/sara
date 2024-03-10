import "@mantine/core/styles.css";
import "@rainbow-me/rainbowkit/styles.css";
import "@css/index.css";

import { MantineProvider } from "@mantine/core";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { config, myRainbowExtendedTheme } from "@configs/rainbow.config";
import { theme } from "./theme";

// Components
import { Index } from "@pages/Index";

const queryClient = new QueryClient();
const App = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={myRainbowExtendedTheme}>
          <MantineProvider theme={theme}>
            <Index />
          </MantineProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
