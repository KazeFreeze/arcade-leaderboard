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
      // Use the NEXT_PUBLIC_ prefixed variable here as well for consistency
      if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        return true; // Allow sign-in for the admin
      } else {
        // Log unauthorized attempts for monitoring, but return a redirect
        // to prevent the user from being stuck on an error page.
        console.log(`Unauthorized sign-in attempt by: ${user.email}`);
        return "/unauthorized"; // Redirect non-admin users
      }
    },
    /**
     * The session callback adds the user's role to the session object,
     * so it's available on the client-side.
     */
    async session({ session, token }) {
      if (session?.user) {
        // @ts-ignore
        session.user.isAdmin =
          token.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin", // Redirect users to the admin page to sign in
    error: "/api/auth/error", // Custom error page
  },
};
