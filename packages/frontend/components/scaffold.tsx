import { Box } from "@chakra-ui/react";
import Head from "next/head";

export default function Scaffold({ children }: { children: React.ReactNode }) {
  return (
    <Box as="main">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Passport Pally: Create professional passport photographs that meet official
                requirements in seconds with our AI-powered tool"
        />
        {/* <meta name="author" content="Adegbemile Bolu" /> */}
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta property="og:site_name" content="Passport Pally" />
        <meta property="og:title" content="Passport Pally" />
        <meta property="og:type" content="website" />
        {/* <meta name="twitter:title" content="Adegbemile Bolu" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@blwtf" />
        <meta name="twitter:creator" content="@blwtf" /> */}
        <title>Passport Pally</title>
      </Head>

      {children}
    </Box>
  );
}
