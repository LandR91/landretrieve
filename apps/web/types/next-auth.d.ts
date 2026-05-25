import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      role: "ADMIN" | "AGENCY" | "AGENT" | "VISITOR";
      avatar: string | null;
      firstName: string | null;
      lastName: string | null;
      displayName: string | null;
      agencyProfile: { id: string; slug: string; name: string; isVerified: boolean } | null;
      agentProfile: { id: string; slug: string; isVerified: boolean } | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    remember: boolean;
    avatar: string | null;
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    agencyProfile: { id: string; slug: string; name: string; isVerified: boolean } | null;
    agentProfile: { id: string; slug: string; isVerified: boolean } | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    avatar: string | null;
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    agencyProfile: { id: string; slug: string; name: string; isVerified: boolean } | null;
    agentProfile: { id: string; slug: string; isVerified: boolean } | null;
  }
}
