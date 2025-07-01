import { Flex, Image, Heading, Badge } from "@chakra-ui/react";

export default function Logo(
  { isAdmin }: { isAdmin?: boolean } = { isAdmin: false }
) {
  return (
    <Flex gap="2" position="relative">
      <Heading size="lg" variant="logo">
        PassportPally
      </Heading>

      <Image src="passport-pally-logo.png" alt="logo" height="35px" />

      {isAdmin && (
        <Badge
          variant="outline"
          colorScheme="brand"
          position="absolute"
          right={-14}
        >
          Admin
        </Badge>
      )}
    </Flex>
  );
}
