import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // Add more providers here if needed
  ],
  // You can add more NextAuth.js config here (callbacks, database, etc.)
};

export default NextAuth(authOptions);