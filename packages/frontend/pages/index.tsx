/* eslint-disable @typescript-eslint/no-unused-vars */
import UploadArea from "@/components/upload-area";
import { fileToBlob } from "@/lib/helpers";
import useAuth from "@/lib/hooks/useAuth";
import useSSE from "@/lib/hooks/useSSE";
import { UserState, UserStatePreview } from "@/lib/types/users";
import {
  useToast,
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Button,
  VStack,
  Divider,
  FormControl,
  FormLabel,
  Select,
  Switch,
  Badge,
  Text,
  Image,
  SimpleGrid,
  Spinner,
  Skeleton,
} from "@chakra-ui/react";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import { GetServerSidePropsContext } from "next/types";
import { useEffect, useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { AuthSession } from "@/lib/types/session";
import { getUserStatePreview } from "@/lib/api/users";
import StateImage from "@/components/state-image";
import { ArrowBigDown } from "lucide-react";
import useIndexedDB from "@/lib/hooks/useIndexedDB";
import Logo from "@/components/logo";
import OptionsSection from "@/components/options-section";

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext) {
  const session: AuthSession | null = await getServerSession(
    req,
    res,
    authOptions
  );
  const user = session?.user;

  if (user) {
    try {
      const statePreview = await getUserStatePreview(user.accessToken!);
      return {
        props: { statePreview },
      };
    } catch (_) {
      return {
        props: {},
      };
    }
  }

  return {
    props: {},
  };
}

export default function Index({
  statePreview,
}: {
  statePreview?: UserStatePreview;
}) {
  console.log("statePreview", statePreview);
  const { session, isUnauthenticated, authFetch } = useAuth();
  console.log(session);
  const user = session?.user;
  const { error, setValue, getValue, deleteValue } = useIndexedDB();
  const { data: userStateStream } = useSSE<UserStatePreview>(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/state`
  );
  const [uploadedImage, setUploadedImage] = useState<File>();
  const [imagePreview, setImagePreview] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const toast = useToast();
  const userState = userStateStream ?? statePreview;
  console.log("userState", userState);
  const MAX_SIZE = 10 * 1024 * 1024;

  useEffect(() => {
    const getCachedImage = async () => {
      if (userState?.userPhoto) {
        const image = await getValue<string>(userState?.userPhoto);
        setImagePreview(image);
      }
    };

    getCachedImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userState?.userPhoto]);

  const handleFileSelect = async (file: File) => {
    setUploadError(undefined);
    setIsUploading(true);
    setUploadedImage(file);

    if (!file) {
      return;
    }

    if (file.size > MAX_SIZE) {
      const errMsg = "File size must be less than 10MB";
      setUploadError(errMsg);
      toast({
        title: "Image too large",
        description: errMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      if (isUnauthenticated) {
        await signIn("credentials", { redirect: false });
      }

      fileToBlob(file, async (result) => {
        setImagePreview(result as string);
        await setValue(file.name, result);
      });

      const formData = new FormData();
      formData.append("file", file as Blob);

      await authFetch("/upload", "POST", formData);
    } catch (error) {
      console.log(error);
      setUploadError((error as Error).message);
      toast({
        title: "Error!",
        description: (error as Error).message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // useEffect(() => {
  //   if (
  //     userState?.userPhoto &&
  //     (isUploading || !imagePreview || imagePreview === "preview")
  //   ) {
  //     if (userState?.userPhoto) {
  //       if ((userState?.userPhoto as unknown as string) !== "preview") {
  //         const buffer = Buffer.from(userState?.userPhoto.buffer);

  //         const blob = new Blob([buffer], {
  //           type: userState?.userPhoto.mimetype,
  //         });

  //         fileToBlob(blob, (result) => {
  //           setImagePreview(result);
  //         });
  //       } else {
  //         setImagePreview(userState?.userPhoto as unknown as string);
  //       }
  //     }
  //   }
  // }, [imagePreview, isUploading, userState?.userPhoto]);

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your passport photo is being downloaded.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleReset = () => {
    setUploadedImage(undefined);
    setImagePreview(undefined);
  };

  return (
    <Box minH="100vh">
      <Box className="gradient-bg" py={6} mb={10}>
        <Container maxW="container.xl">
          <Flex alignItems="center" justifyContent="space-between">
            <Logo />
            <HStack spacing={4}>
              <Button variant="ghost" _hover={{ bg: "whiteAlpha.200" }}>
                Pricing
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl">
        <Box mb={10}>
          <VStack spacing={10}>
            <Box w="100%" maxW="800px" mx="auto">
              {(!userState || userState?.value === "idle") && (
                <VStack spacing={8}>
                  <VStack spacing={4} textAlign="center">
                    <Heading size="lg">Create Perfect Passport Photos</Heading>
                    <Text fontSize="md" color="gray.600">
                      Upload your photo and our AI will generate professional
                      passport photos that meet official requirements
                    </Text>
                  </VStack>

                  <UploadArea
                    onFileSelect={handleFileSelect}
                    isUploading={isUploading}
                  />
                </VStack>
              )}

              {userState?.value === "photoUploaded" && (
                <OptionsSection
                  imagePreview={imagePreview}
                  isUploading={isUploading}
                />
              )}

              {userState?.value === "generating" && (
                <VStack spacing={8} align="center">
                  <VStack spacing={3} textAlign="center">
                    <Heading size="lg">Your Passport Photo is Ready!</Heading>
                    <Text color="gray.600">
                      Your photo meets all requirements for the selected
                      document type
                    </Text>
                  </VStack>

                  <Flex
                    gap={8}
                    direction="column"
                    align="center"
                    justify="center"
                    wrap="wrap"
                  >
                    <VStack>
                      <Text fontWeight="medium" mb={2}>
                        Original Photo
                      </Text>
                      <Box
                        borderWidth="1px"
                        borderRadius="md"
                        overflow="hidden"
                        w="200px"
                        h="250px"
                        bg="gray.100"
                      >
                        {imagePreview && (
                          <Image
                            src={imagePreview}
                            alt="Original"
                            w="100%"
                            h="100%"
                            objectFit="cover"
                          />
                        )}
                      </Box>
                    </VStack>

                    <Box fontSize="24px" color="gray.400">
                      <ArrowBigDown />
                    </Box>

                    <SimpleGrid columns={{ base: 2, md: 3 }} gap={5}>
                      {userState.generatedPhotos.map((generatedPhoto) => (
                        <Box
                          key={generatedPhoto.id}
                          borderWidth="1px"
                          borderRadius="md"
                          overflow="hidden"
                          w="200px"
                          h="250px"
                          bg="white"
                          className="card-shadow"
                        >
                          <StateImage image={generatedPhoto} />
                        </Box>
                      ))}
                      {userState.generationRequests.map((generationRequest) => (
                        <Box
                          key={generationRequest.id}
                          borderWidth="1px"
                          borderRadius="md"
                          overflow="hidden"
                          w="200px"
                          h="250px"
                          bg="white"
                          className="card-shadow"
                        >
                          <StateImage />
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Flex>

                  <VStack spacing={4} w="100%" maxW="400px">
                    <Button
                      onClick={handleDownload}
                      colorScheme="blue"
                      size="lg"
                      width="100%"
                      leftIcon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                          <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                        </svg>
                      }
                    >
                      Download Digital Copy
                    </Button>

                    <Button variant="outline" colorScheme="blue" width="100%">
                      Order Printed Photos
                    </Button>

                    <Button
                      onClick={handleReset}
                      variant="ghost"
                      colorScheme="blue"
                    >
                      Create Another Photo
                    </Button>
                  </VStack>
                </VStack>
              )}
            </Box>
          </VStack>
        </Box>

        {/* Features Section */}
        {/* {step === 1 && (
          <Box mt={16}>
            <Heading textAlign="center" mb={10}>
              Why Choose Our Passport Photo Generator
            </Heading>
            <Flex gap={6} flexWrap="wrap" justify="center">
              <Box flex="1" minW="250px" maxW="350px">
                <FeatureCard
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                    </svg>
                  }
                  title="AI-Powered Enhancement"
                  description="Our advanced AI automatically enhances your photo to meet all official requirements while maintaining natural appearance."
                />
              </Box>
              <Box flex="1" minW="250px" maxW="350px">
                <FeatureCard
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                      <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
                    </svg>
                  }
                  title="Guaranteed Compliance"
                  description="Photos are guaranteed to meet official requirements for passports, visas, IDs and more across 150+ countries."
                />
              </Box>
              <Box flex="1" minW="250px" maxW="350px">
                <FeatureCard
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z" />
                      <path d="M9.5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                      <path d="M7.411 8.034a.5.5 0 0 1 .493-.417h.156a.5.5 0 0 1 .492.414l.347 2a.5.5 0 0 1-.493.585h-.835a.5.5 0 0 1-.493-.582l.333-2z" />
                    </svg>
                  }
                  title="Secure & Private"
                  description="Your photos are processed securely and deleted automatically. We never store or share your biometric data."
                />
              </Box>
            </Flex>
          </Box>
        )} */}

        {/* Testimonials */}
        {/* {step === 1 && (
          <Box mt={16} bg="gray.50" py={10} px={6} borderRadius="lg">
            <Heading textAlign="center" mb={8} size="lg">
              What Our Users Say
            </Heading>
            <Flex gap={6} flexWrap="wrap" justify="center">
              {[
                {
                  text: "The AI perfectly adjusted my photo to meet US passport requirements. Saved me a trip to the photo store!",
                  author: "Sarah T.",
                },
                {
                  text: "Used this for my visa application. The photo was accepted without any issues. Highly recommend!",
                  author: "Michael K.",
                },
                {
                  text: "So easy to use! Took a selfie at home and had professional passport photos in minutes.",
                  author: "Priya M.",
                },
              ].map((testimonial, index) => (
                <Box
                  key={index}
                  bg="white"
                  p={5}
                  borderRadius="md"
                  boxShadow="md"
                  flex="1"
                  minW="250px"
                  maxW="350px"
                >
                  <Text fontSize="lg" fontStyle="italic" mb={4}>
                    {`"${testimonial.text}"`}
                  </Text>
                  <Text fontWeight="bold">— {testimonial.author}</Text>
                </Box>
              ))}
            </Flex>
          </Box>
        )} */}

        {/* FAQ */}
        {/* {step === 1 && (
          <Box mt={16}>
            <Heading textAlign="center" mb={8}>
              Frequently Asked Questions
            </Heading>
            <VStack spacing={4} align="stretch" maxW="800px" mx="auto">
              {[
                {
                  q: "How does the passport photo generator work?",
                  a: "Our AI analyzes your photo, enhances it to meet official requirements, and adjusts the background, lighting, and composition to create a compliant passport photo.",
                },
                {
                  q: "Are the photos guaranteed to be accepted?",
                  a: "Yes! All photos are guaranteed to meet official requirements for the selected document type and country. If your photo is rejected, we'll provide a full refund.",
                },
                {
                  q: "How quickly will I receive my digital photos?",
                  a: "Digital photos are generated instantly and available for download immediately after processing, which typically takes less than 30 seconds.",
                },
                {
                  q: "Can I order printed copies of my passport photos?",
                  a: "Yes! After generating your photo, you can order professional prints that will be delivered to your address within 1-3 business days.",
                },
              ].map((faq, index) => (
                <Box
                  key={index}
                  borderWidth="1px"
                  borderRadius="md"
                  p={5}
                  _hover={{ bg: "gray.50" }}
                >
                  <Heading size="sm" mb={2}>
                    {faq.q}
                  </Heading>
                  <Text color="gray.600">{faq.a}</Text>
                </Box>
              ))}
            </VStack>
          </Box>
        )} */}
      </Container>

      {/* Footer */}
      <Box mt={20} bg="gray.800" color="white" py={10}>
        <Container maxW="container.xl">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "center", md: "start" }}
            gap={8}
          >
            <VStack align="start" spacing={4} maxW="320px">
              <Logo />
              <Text color="gray.400">
                Create professional passport and ID photos that meet official
                requirements in seconds with our AI-powered tool.
              </Text>
            </VStack>

            {/* <Flex gap={10} wrap="wrap">
              <VStack align="start" spacing={3}>
                <Heading size="sm" mb={2}>
                  Product
                </Heading>
                {["Features", "Pricing", "Examples", "Blog"].map((item) => (
                  <Box
                    key={item}
                    as="a"
                    href="#"
                    color="gray.400"
                    _hover={{ color: "white" }}
                  >
                    {item}
                  </Box>
                ))}
              </VStack>

              <VStack align="start" spacing={3}>
                <Heading size="sm" mb={2}>
                  Support
                </Heading>
                {[
                  "Help Center",
                  "Contact Us",
                  "Privacy Policy",
                  "Terms of Service",
                ].map((item) => (
                  <Box
                    key={item}
                    as="a"
                    href="#"
                    color="gray.400"
                    _hover={{ color: "white" }}
                  >
                    {item}
                  </Box>
                ))}
              </VStack>

              <VStack align="start" spacing={3}>
                <Heading size="sm" mb={2}>
                  Resources
                </Heading>
                {[
                  "Photo Requirements",
                  "Country Guidelines",
                  "Size Charts",
                  "Developer API",
                ].map((item) => (
                  <Box
                    key={item}
                    as="a"
                    href="#"
                    color="gray.400"
                    _hover={{ color: "white" }}
                  >
                    {item}
                  </Box>
                ))}
              </VStack>
            </Flex> */}
          </Flex>

          <Divider my={8} borderColor="gray.700" />

          <Flex
            justify="space-between"
            align="center"
            direction={{ base: "column", sm: "row" }}
            gap={4}
          >
            <Text color="gray.500">
              © 2025 Passport Pally. All rights reserved.
            </Text>
            {/* <HStack spacing={6}>
              <Text
                as="a"
                href="#"
                color="gray.500"
                _hover={{ color: "gray.300" }}
              >
                Privacy
              </Text>
              <Text
                as="a"
                href="#"
                color="gray.500"
                _hover={{ color: "gray.300" }}
              >
                Terms
              </Text>
              <Text
                as="a"
                href="#"
                color="gray.500"
                _hover={{ color: "gray.300" }}
              >
                Cookies
              </Text>
            </HStack> */}
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
