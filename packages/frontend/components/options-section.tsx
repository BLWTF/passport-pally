import useAuth from "@/lib/hooks/useAuth";
import {
  Box,
  Heading,
  Badge,
  Flex,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Button,
  Spinner,
  Skeleton,
  Image,
  Text,
  Input,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

const countrySpecs = [
  {
    ico: "us",
    country: "United States",
    size: "51",
    headHeight: "25 to 35",
    backgroundColor: ["white"],
  },
  {
    ico: "uk",
    country: "United Kingdom",
    size: "35 to 45",
    headHeight: "29 to 34",
    eyePosition: "20 to 30",
    backgroundColor: ["light grey", "cream"],
  },
  {
    ico: "ca",
    country: "Canada",
    size: "50 to 70",
    headHeight: "31 to 36",
    backgroundColor: ["white"],
  },
  {
    ico: "ng",
    country: "Nigeria",
    size: "35 to 45",
    backgroundColor: ["white"],
  },
  {
    ico: "in",
    country: "India",
    size: "51",
    headHeight: "25 to 35",
    backgroundColor: ["white"],
  },
  {
    ico: "ch",
    country: "China",
    size: "33 to 48",
    headHeight: "28 to 33",
    backgroundColor: ["white"],
  },
  {
    ico: "ja",
    country: "Japan",
    size: "35 to 45",
    headHeight: "32 to 36",
    backgroundColor: ["white", "light blue"],
  },
  {
    ico: "eu",
    country: "European Union",
    size: "35 to 45",
    headHeight: "32 to 36",
    eyePosition: "26 to 30",
    backgroundColor: ["white", "cream", "light grey"],
  },
];

export default function OptionsSection({
  imagePreview,
  isUploading,
}: {
  imagePreview?: string;
  isUploading: boolean;
}) {
  const { authFetch } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState<{
    ico: string;
    country: string;
    size: string;
    headHeight?: string;
    backgroundColor: string[];
  }>({
    ico: "",
    size: "",
    country: "",
    headHeight: "",
    backgroundColor: ["white"],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGenerate = async (e: any) => {
    e.preventDefault();
    setIsGenerating(true);

    console.log('selectedSpec', selectedSpec);
    await authFetch("/generate", "POST", selectedSpec);
  };

  const colors: Record<string, string> = {
    white: "white",
    "light grey": "gray.100",
    cream: "yellow.100",
    "light blue": "blue.100",
  };

  useEffect(() => {
    if (selectedSpec.ico) {
      const spec = countrySpecs.find((e) => e.ico === selectedSpec.ico);
      if (spec) {
        setSelectedSpec(spec);
      }
    }
  }, [selectedSpec.ico]);

  return (
    <Flex gap={8} direction={{ base: "column-reverse", md: "row" }}>
      <Box as="form" flex={1} onSubmit={handleGenerate}>
        <VStack spacing={6} align="start">
          <Heading size="md">Select Options</Heading>

          <FormControl isRequired>
            <FormLabel>Country</FormLabel>
            <Select
              placeholder="Select country"
              defaultValue="us"
              value={selectedSpec.ico}
              onChange={(e) =>
                setSelectedSpec((spec) => ({ ...spec, ico: e.target.value }))
              }
            >
              {countrySpecs.map((spec) => (
                <option key={spec.ico} value={spec.ico}>
                  {spec.country}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Size (mm)</FormLabel>
            <Input
              name="size"
              type="text"
              placeholder="eg. 25, 20 to 35"
              value={selectedSpec.size}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Head Height (mm)</FormLabel>
            <Input
              name="headHeight"
              type="text"
              placeholder="eg. 25, 20 to 35"
              value={selectedSpec.headHeight}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Background Color</FormLabel>
            <Flex gap={2}>
              {Object.keys(colors).map((color) => (
                <Box
                  key={color}
                  borderRadius="full"
                  w="40px"
                  h="40px"
                  bgColor={colors[color]}
                  borderWidth={
                    selectedSpec.backgroundColor.includes(color)
                      ? "medium"
                      : "thin"
                  }
                  borderStyle="solid"
                  borderColor={
                    selectedSpec.backgroundColor.includes(color)
                      ? "blue.500"
                      : "gray.500"
                  }
                  cursor="pointer"
                  onClick={() =>
                    setSelectedSpec((spec) => ({
                      ...spec,
                      backgroundColor: [color],
                    }))
                  }
                ></Box>
              ))}
            </Flex>
          </FormControl>

          <Button
            type="submit"
            size="lg"
            width="100%"
            isLoading={isGenerating}
            loadingText="Generating"
          >
            Generate Passport Photo
          </Button>
        </VStack>
      </Box>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection={{ base: "row", md: "column" }}
        flex={1}
        gap={4}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderWidth="1px"
          borderRadius="md"
          overflow="hidden"
          w="100%"
          maxW={{ base: "50px", md: "300px" }}
          aspectRatio={3 / 4}
          bg="gray.100"
          position="relative"
        >
          {isUploading && (
            <Box
              position="absolute"
              w="100%"
              h="100%"
              p={5}
              display="flex"
              alignItems="center"
              justifyContent="center"
              bgColor="gray.400"
              opacity="0.5"
            >
              <Spinner w="100px" h="100px" thickness="20px" size="xl" />
            </Box>
          )}
          {imagePreview && imagePreview !== "preview" && (
            <Image
              src={imagePreview}
              alt="Preview"
              w="100%"
              h="100%"
              objectFit="cover"
            />
          )}
          {imagePreview && imagePreview === "preview" && (
            <Skeleton w="100%" h="100%" />
          )}
        </Box>
        <VStack justifyContent="center">
          <Text color="gray.500" fontSize="sm">
            Preview of original photo
          </Text>
          <Badge colorScheme="green">Image quality: Good</Badge>
        </VStack>
      </Box>
    </Flex>
  );
}
