import { googleSignIn, loginUser, tempLoginUser } from "@/lib/api/users";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

class InvalidLoginError extends Error {
  code = "Invalid identifier or password";
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Strapi",
      credentials: {
        identifier: {
          label: "Username/Email",
          type: "text",
          placeholder: "Username/Email",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (credentials?.identifier) {
            const user = await loginUser({
              identifier: credentials.identifier,
              password: credentials.password,
            });

            return { ...user };
          } else {
            const user = await tempLoginUser();

            return { ...user };
          }
        } catch (error) {
          console.error(error);
          // return null;
          throw InvalidLoginError;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ user, token, trigger, session, account, profile }) {
      if (user) {
        token.user = user;
      }

      if (account?.provider === "google") {
        const resUser = await googleSignIn({
          googleProviderAccountId: profile?.sub,
          email: profile?.email,
          firstName: profile?.name!.split(" ")[0],
          lastName: profile?.name!.split(" ")[1],
        });

        token.user = { ...resUser };
      }

      if (trigger === "update" && session.user) {
        token.user = { ...(token.user as object), ...session.user };
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.user) {
        session.user = token.user;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
