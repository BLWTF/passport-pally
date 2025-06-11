import { tempLoginUser } from "@/lib/api/users";
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
      async authorize() {
        // if (!credentials?.identifier) {
        //   console.log("ahah");
        // }
        try {
          const user = await tempLoginUser();

          return { ...user };
        } catch (error) {
          console.error(error);
          // return null;
          throw InvalidLoginError;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ user, token, trigger, session }) {
      if (user) {
        token.user = user;
      }
      // if (account?.provider === 'google') {
      //   const resUser = await googleSignIn({
      //     googleProviderAccountId: profile?.sub,
      //     email: profile?.email,
      //     firstName: profile?.name!.split(" ")[0],
      //     lastName: profile?.name!.split(" ")[1],
      //   });

      //   token.user = { ...resUser };
      // }

      if (trigger === "update" && session.user) {
        // Note, that `session` can be any arbitrary object, remember to validate it!
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
