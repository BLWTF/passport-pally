import { base64toBlob } from "@/lib/helpers";
import useIndexedDB from "@/lib/hooks/useIndexedDB";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  useDisclosure,
} from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Download, Maximize2Icon } from "lucide-react";
import { useEffect, useState } from "react";

const CustomBox = styled(Box)`
  &:hover .menu {
    opacity: 1;
    pointer-events: all;
  }
`;

export default function GeneratedPassportPhoto({
  image,
}: {
  image?: { id: string; data: string };
}) {
  const { setValue, getValue } = useIndexedDB();
  const [preview, setPreview] = useState("preview");
  const {
    isOpen: isMaximiseOpen,
    onOpen: onMaximiseOpen,
    onClose: onMaximiseClose,
  } = useDisclosure();
  const {
    isOpen: isMobileDownloadOpen,
    onOpen: onMobileDownloadOpen,
    onClose: onMobileDownloadClose,
  } = useDisclosure();
  const {
    isOpen: isDownloadOpen,
    onOpen: onDownloadOpen,
    onClose: onDownloadClose,
  } = useDisclosure();

  const handleDownload = () => {
    if (image?.data) {
      const buffer = Buffer.from(image.data, "base64");
      const blob = new Blob([buffer], { type: "image/png" });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "gen.png";

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onMobileDownloadClose();
      onDownloadClose();
    }
  };

  useEffect(() => {
    const getCachedImage = async () => {
      if (image && image.data === "preview") {
        const cachedImage = await getValue<string>(image!.id);

        if (cachedImage) {
          setPreview(cachedImage);
        }
      }
    };

    if (image && image.data !== "preview") {
      base64toBlob(image.data, async (result) => {
        setPreview(result);
        const cachedImage = await getValue<string>(image!.id);

        if (!cachedImage) {
          await setValue(image.id, result);
        }
      });
    }

    getCachedImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  return (
    <CustomBox
      borderWidth="1px"
      borderRadius="md"
      overflow="hidden"
      w={{ base: "150px", md: "200px" }}
      h={{ base: "180px", md: "250px" }}
      bg="white"
      position="relative"
      boxShadow="2xl"
    >
      {preview !== "preview" && (
        <>
          <Box
            className="menu"
            opacity={0}
            h="33%"
            w="100%"
            position="absolute"
            bottom={0}
            bg="linear-gradient(to bottom, transparent 10%, black 75%)"
            transition="ease-in-out 0.1s"
            display="flex"
            alignItems="end"
            pointerEvents="none"
          >
            <Flex w="100%" justify="center">
              <IconButton
                display={{ base: "flex", md: "none" }}
                aria-label="enlarge"
                variant="ghost"
                bg="transparent"
                color="gray.300"
                _hover={{
                  color: "white",
                  bg: "transparent",
                }}
                icon={<Download />}
                onClick={() => onMobileDownloadOpen()}
              />
              <IconButton
                display={{ base: "none", md: "flex" }}
                aria-label="enlarge"
                variant="ghost"
                bg="transparent"
                color="gray.300"
                _hover={{
                  color: "white",
                  bg: "transparent",
                }}
                icon={<Download />}
                onClick={() => onDownloadOpen()}
              />
              <IconButton
                aria-label="enlarge"
                variant="ghost"
                bg="transparent"
                color="gray.300"
                _hover={{
                  color: "white",
                  bg: "transparent",
                }}
                icon={<Maximize2Icon />}
                onClick={() => onMaximiseOpen()}
              />
            </Flex>
          </Box>
          <Image
            src={preview}
            alt="Generated"
            w="100%"
            h="100%"
            objectFit="contain"
          />
        </>
      )}
      {preview === "preview" && <Skeleton w="100%" h="100%" />}
      <Modal isOpen={isMaximiseOpen} onClose={onMaximiseClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <Image
              src={preview}
              alt="Generated"
              w="100%"
              h="100%"
              objectFit="contain"
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDownloadOpen} onClose={onDownloadClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader display="flex" justifyContent="space-between">
            Download Image
            <Image
              src={preview}
              alt="Generated"
              w="50px"
              h="50px"
              objectFit="contain"
            />
          </ModalHeader>
          <ModalBody display="flex" gap={2}>
            <Button variant="secondary" onClick={() => handleDownload()}>
              Continue
            </Button>
            <Button variant="outline" onClick={() => onDownloadClose()}>
              Cancel
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Drawer
        placement="bottom"
        onClose={onMobileDownloadClose}
        isOpen={isMobileDownloadOpen}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader
            borderBottomWidth="1px"
            display="flex"
            justifyContent="space-between"
          >
            Download Image
            <Image
              src={preview}
              alt="Generated"
              w="50px"
              h="50px"
              objectFit="contain"
            />
          </DrawerHeader>
          <DrawerBody display="flex" flexDirection="column" gap={3}>
            <Button variant="secondary" onClick={() => handleDownload()}>
              Continue
            </Button>
            <Button variant="outline" onClick={() => onMobileDownloadClose()}>
              Cancel
            </Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </CustomBox>
  );
}
