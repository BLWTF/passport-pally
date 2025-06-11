import { Box, VStack, Heading, Text } from "@chakra-ui/react";

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Box
    borderWidth="1px"
    borderRadius="lg"
    overflow="hidden"
    p={5}
    className="card-shadow"
    bg="white"
    transition="transform 0.3s"
    _hover={{ transform: "translateY(-5px)" }}
  >
    <VStack spacing={3} align="start">
      <Box bg="brand.50" p={3} borderRadius="full" color="brand.500">
        {icon}
      </Box>
      <Heading size="md">{title}</Heading>
      <Text color="gray.600">{description}</Text>
    </VStack>
  </Box>
);

export default FeatureCard;
