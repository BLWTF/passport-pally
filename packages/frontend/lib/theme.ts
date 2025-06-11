import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#e6f7ff",
      100: "#bae7ff",
      200: "#91d5ff",
      300: "#69c0ff",
      400: "#40a9ff",
      500: "#1890ff",
      600: "#096dd9",
      700: "#0050b3",
      800: "#003a8c",
      900: "#002766",
    },
  },
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "600",
        borderRadius: "md",
      },
      variants: {
        primary: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
          },
        },
      },
    },
  },
});

export default theme;
