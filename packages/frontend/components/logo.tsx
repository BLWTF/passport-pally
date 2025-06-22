import { Flex, Image, Heading } from "@chakra-ui/react";

export default function Logo() {
  return (
    <Flex gap="2">
      <Heading size="lg" variant="logo">
        PassportPally
      </Heading>

      <Image src="passport-pally-logo.png" alt="logo" height="35px" />
    </Flex>
  );
}
