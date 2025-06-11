import { Box, Heading, Input, VStack, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ChangeEvent, DragEvent, useState } from "react";

const UploadArea = ({
  onFileSelect,
}: {
  onFileSelect: (e: File) => void;
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <Box
      className={`upload-box ${dragActive ? "border-brand-500 bg-blue-50" : ""}`}
      p={10}
      textAlign="center"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Input
        type="file"
        accept="image/*"
        onChange={handleChange}
        opacity="0"
        position="absolute"
        id="file-upload"
      />
      <VStack spacing={4}>
        <Box as="label" htmlFor="file-upload" cursor="pointer" w="100%">
          <Box
            as={motion.div}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            bg="brand.50"
            color="brand.500"
            p={4}
            borderRadius="full"
            display="inline-flex"
            mb={4}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
              <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
            </svg>
          </Box>
          <Heading size="md" mb={2}>
            Upload Your Photo
          </Heading>
          <Text color="gray.500">
            Drag and drop your image here, or click to select
          </Text>
          <Text fontSize="sm" color="gray.400" mt={2}>
            Supports JPG, PNG, HEIC - Max 10MB
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default UploadArea;
