import { Box } from "@chakra-ui/react";

const StepComponent = ({
  number,
  isActive,
  isCompleted,
}: {
  number: number;
  isActive: boolean;
  isCompleted: boolean;
}) => (
  <Box
    borderRadius="full"
    w="40px"
    h="40px"
    display="flex"
    alignItems="center"
    justifyContent="center"
    bg={isCompleted ? "brand.500" : isActive ? "white" : "gray.200"}
    border={isActive ? "2px solid" : "none"}
    borderColor="brand.500"
    color={isCompleted ? "white" : isActive ? "brand.500" : "gray.500"}
    fontWeight="bold"
  >
    {isCompleted ? "✓" : number}
  </Box>
);

export default StepComponent;
