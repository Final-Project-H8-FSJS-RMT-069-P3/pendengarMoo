import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getDB } from "../server/config/mongodb";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "USER" | "DOCTOR";
    };
  }
  interface User {
    id: string;
    role: "USER" | "DOCTOR";
  }
}

const mapRole = (role: unknown): "USER" | "DOCTOR" => {
  const value = String(role ?? "").toLowerCase();
  return value === "psychiatrist" || value === "doctor" ? "DOCTOR" : "USER";
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const db = await getDB();
        const usersCollection = db.collection("Users");
        const user = await usersCollection.findOne({
          email: credentials.email,
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!passwordMatch) {
          return null;
        }

        const role =
          user.role === "psychiatrist" || user.role === "DOCTOR"
            ? "DOCTOR"
            : "USER";

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: mapRole(user.role),
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      if (!user.email) return false;

      const db = await getDB();
      const usersCollection = db.collection("Users");
      const existingUser = await usersCollection.findOne({ email: user.email });

      if (!existingUser) {
        await usersCollection.insertOne({
          name: user.name ?? "Google User",
          email: user.email,
          image: user.image ?? null,
          role: "USER",
          provider: "google",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else if (!existingUser.image && user.image) {
        await usersCollection.updateOne(
          { _id: existingUser._id },
          { $set: { image: user.image, updatedAt: new Date() } },
        );
      }

      return true;
    },

    async jwt({ token, user }) {
      const authUser = user as
        | { id?: string; role?: "USER" | "DOCTOR" }
        | undefined;

      if (authUser?.id) token.id = authUser.id;
      if (authUser?.role) token.role = authUser.role;

      // Fallback for Google / existing DB users
      if ((!token.id || !token.role) && token.email) {
        const db = await getDB();
        const usersCollection = db.collection("Users");
        const dbUser = await usersCollection.findOne({ email: token.email });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = mapRole(dbUser.role);
        } else {
          token.role = "USER";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as "USER" | "DOCTOR") ?? "USER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
