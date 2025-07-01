import Scaffold from "@/components/scaffold";
import theme from "@/lib/theme";
import "@/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Space_Grotesk, Caprasimo } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "latin-ext", "vietnamese"],
});

const caprasimo = Caprasimo({
  weight: ["400"],
  subsets: ["latin", "latin-ext"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>
        {`
          :root {
            --font-caprasimo: ${caprasimo.style.fontFamily};
            --font-space-grotesk: ${spaceGrotesk.style.fontFamily};
          }
        `}
      </style>
      <ChakraProvider theme={theme}>
        <SessionProvider>
          <Scaffold>
            <Component {...pageProps} />
          </Scaffold>
        </SessionProvider>
      </ChakraProvider>
    </>
  );
}
