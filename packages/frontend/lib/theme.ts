import { defineStyleConfig, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: () => ({
      "html, body": {
        // bg: "#fff",
        // color: "#000",
        fontFamily: "var(--font-space-grotesk)",
      },
    }),
  },
  colors: {
    brand: {
      50: "#e6f7ff",
      100: "#bae7ff",
      200: "#91d5ff",
      300: "#69c0ff",
      400: "#40a9ff",
      500: "#246793",
      600: "#096dd9",
      700: "#0050b3",
      800: "#003a8c",
      900: "#002766",
    },
  },
  components: {
    Heading: {
      baseStyle: {
        fontFamily: "var(--font-space-grotesk)",
      },
      variants: {
        logo: {
          fontFamily: "var(--font-caprasimo)",
          color: "#246793",
        },
      },
    },
    Button: defineStyleConfig({
      defaultProps: {
        variant: 'primary'
      },
      baseStyle: {
        fontWeight: "600",
        borderRadius: "md",
        bg: "gray.100",
        boxShadow: "md",
        _hover: {
          _disabled: "#246793",
          color: "white",
          bg: "#246793",
        },
        _focus: {
          color: "white",
          bg: "#246793",
        },
        _disabled: {
          color: "white",
          bg: "#246793",
        },
        _active: {
          color: "white",
          bg: "#246793",
        },
      },
    }),
  },
});

export default theme;
