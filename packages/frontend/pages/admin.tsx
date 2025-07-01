import Logo from "@/components/logo";
import useAuth from "@/lib/hooks/useAuth";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  useToast,
} from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import { ChangeEvent, FormEvent, useState } from "react";
import NextLink from "next/link";
import useSSE from "@/lib/hooks/useSSE";
import { AdminState } from "@/lib/types/users";

export default function Admin() {
  const { isLoading, isUnauthenticated, isAuthenticated } =
    useAuth();
  const [inputs, setInputs] = useState({ identifier: "", password: "" });
  const [isSigningIn, setIsSigningIn] = useState(false);
  const toast = useToast();
  const { data: adminState } = useSSE<AdminState>(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/state`
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs((inputs) => ({
      ...inputs,
      [name]: value,
    }));
  };

  const handleSignIn = async (e: FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsSigningIn(true);
    try {
      await signIn("credentials", {
        identifier: inputs.identifier,
        password: inputs.password,
        redirect: false,
      });
    } catch (error) {
      console.log("error", error);
      toast({
        title: "Error!",
        description: (error as Error).message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Box minH="100vh">
      <Box className="gradient-bg" py={6} mb={10}>
        <Container maxW="container.xl">
          <Flex alignItems="center" justifyContent="space-between">
            <Logo isAdmin />
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl">
        {isLoading && (
          <Box
            w="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Spinner
              size="xl"
              color="brand.500"
              emptyColor="gray.200"
              thickness="10px"
            />
          </Box>
        )}
        {!isLoading && (
          <>
            {isUnauthenticated && (
              <Box
                w="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                {/* <Button
                  rightIcon={<Image alt="google" src="google.png" h="30px" />}
                  onClick={() => handleGoogleSignIn()}
                  isLoading={isSigningIn}
                  loadingText="Signing In With Google"
                >
                  Sign In With Google
                </Button> */}
                <Card
                  as="form"
                  align="center"
                  onSubmit={(e) => handleSignIn(e)}
                >
                  <CardHeader>
                    <Heading size="md">Admin Sign In</Heading>
                  </CardHeader>
                  <CardBody>
                    <FormControl isRequired>
                      <FormLabel>Username</FormLabel>
                      <Input
                        name="identifier"
                        type="text"
                        bgColor="gray.100"
                        value={inputs.identifier}
                        onChange={handleChange}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Password</FormLabel>
                      <Input
                        name="password"
                        type="password"
                        bgColor="gray.100"
                        value={inputs.password}
                        onChange={handleChange}
                      />
                    </FormControl>
                  </CardBody>
                  <CardFooter>
                    <Button type="submit" size="lg" isLoading={isSigningIn}>
                      Login
                    </Button>
                  </CardFooter>
                </Card>
              </Box>
            )}

            {isAuthenticated && (
              <Box
                w="100%"
                display="flex"
                justifyContent="start"
                alignItems="start"
              >
                <Box
                  as={NextLink}
                  href="?fn=users"
                  p={2}
                  display="flex"
                  // alignItems="center"
                  // justifyContent="center"
                  boxShadow="lg"
                  minWidth="100px"
                  minHeight="100px"
                  rounded="md"
                >
                  <Stat>
                    <StatLabel>Users</StatLabel>
                    <StatNumber>{adminState?.users.length}</StatNumber>
                  </Stat>
                </Box>

              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
