import {
  Box,
  Heading,
  Input,
  Progress,
  VStack,
  Text,
  Button,
  Flex,
} from "@chakra-ui/react";
import { CameraIcon, FolderOpen } from "lucide-react";
import { ChangeEvent, DragEvent, useRef, useState } from "react";

const UploadArea = ({
  onFileSelect,
  isUploading,
}: {
  onFileSelect: (e: File) => void;
  isUploading: boolean;
}) => {
  const [dragActive, setDragActive] = useState(false);
  const takePhotoRef = useRef<HTMLInputElement>(null);
  const selectPhotoRef = useRef<HTMLInputElement>(null);

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
      py={10}
      px={5}
      textAlign="center"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      borderStyle="dashed"
      borderWidth="medium"
      borderRadius="lg"
      minW={{ base: "300px", md: "500px" }}
    >
      <VStack spacing={4}>
        {!isUploading && (
          <>
            <Box as="label" htmlFor="file-upload" cursor="pointer" w="100%">
              <Heading size="md" mb={2}>
                Upload Photo
              </Heading>
              <Text
                display={{ base: "block", lg: "none" }}
                fontSize="sm"
                color="gray.400"
                mt={2}
              >
                Tap to upload an image from your device
              </Text>
              <Text
                display={{ base: "none", lg: "block" }}
                fontSize="sm"
                color="gray.400"
                mt={2}
              >
                Drag and drop your image here, or click to select
              </Text>
            </Box>
            <Flex gap={2}>
              <Box display={{ base: "block", lg: "none" }}>
                <Input
                  ref={takePhotoRef}
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  id="image-capture"
                  capture="user"
                  hidden
                />
                <Button
                  size="sm"
                  onClick={() => takePhotoRef.current?.click()}
                  leftIcon={<CameraIcon />}
                >
                  Take a picture
                </Button>
              </Box>
              <Box>
                <Input
                  ref={selectPhotoRef}
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  id="file-upload"
                  hidden
                />
                <Button
                  size="sm"
                  onClick={() => selectPhotoRef.current?.click()}
                  leftIcon={<FolderOpen />}
                >
                  Choose picture
                </Button>
              </Box>
            </Flex>
          </>
        )}

        {isUploading && (
          <>
            <Heading size="md" mb={2}>
                Uploading...
              </Heading>
            <Progress
              size="sm"
              isIndeterminate
              colorScheme="brand"
              w="100%"
              mt={4}
            />
          </>
        )}
      </VStack>
    </Box>
  );
};

export default UploadArea;
