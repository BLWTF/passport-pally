import "@/styles/globals.css";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  
  return (
    <ChakraProvider theme={theme}>
      <SessionProvider>
        <Component {...pageProps} />;
      </SessionProvider>
    </ChakraProvider>
  );
}
