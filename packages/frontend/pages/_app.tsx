import "@/styles/globals.css";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>
        {`
          :root {
            --font-space-grotesk: ${spaceGrotesk.style.fontFamily};
          }
        `}
      </style>
      <ChakraProvider theme={theme}>
        <SessionProvider>
          <Component {...pageProps} />;
        </SessionProvider>
      </ChakraProvider>
    </>
  );
}
