// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

/**
 * This file centralizes the NextAuth.js configuration.
 * It can be imported into your API routes and other server-side files.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  callbacks: {
    /**
     * This callback is used to control who can sign in.
     * It checks if the email of the user trying to sign in matches the ADMIN_EMAIL
     * from your environment variables.
     */
    async signIn({ user }) {
      if (user.email === process.env.ADMIN_EMAIL) {
        return true; // Allow sign-in
      } else {
        console.log(`Unauthorized sign-in attempt by: ${user.email}`);
        return false; // Block sign-in
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
