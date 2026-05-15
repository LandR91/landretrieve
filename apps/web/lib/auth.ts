import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function refreshAccessToken(token: any) {
  try {
    const res = await fetch(`${API}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error("Refresh fallito");
    return {
      ...token,
      accessToken: data.accessToken,
      accessTokenExpires: Date.now() + 14 * 60 * 1000, // 14 min
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${API}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message ?? "Login fallito");
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.displayName,
            image: data.user.avatar,
            role: data.user.role,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            displayName: data.user.displayName,
            avatar: data.user.avatar,
            agencyProfile: data.user.agencyProfile ?? null,
            agentProfile: data.user.agentProfile ?? null,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Primo login
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + 14 * 60 * 1000,
          avatar: user.avatar,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          agencyProfile: user.agencyProfile,
          agentProfile: user.agentProfile,
        };
      }
      // Token ancora valido
      if (Date.now() < (token.accessTokenExpires as number)) return token;
      // Token scaduto → refresh
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as any;
      session.user.avatar = token.avatar as string | null;
      session.user.firstName = token.firstName as string | null;
      session.user.lastName = token.lastName as string | null;
      session.user.displayName = token.displayName as string | null;
      session.user.agencyProfile = token.agencyProfile as any;
      session.user.agentProfile = token.agentProfile as any;
      session.accessToken = token.accessToken as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
