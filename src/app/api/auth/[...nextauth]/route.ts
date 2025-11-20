import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { client } from "@/lib/graphql";
import { FIND_USER_BY_EMAIL } from "@/lib/graphql/queries/users";

// Matches the new query structure
interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  defaultRole: string;
}

const handler = NextAuth({
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        console.log("Authorize function called with credentials:", credentials);

        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password.");
          return null;
        }

        try {
          console.log("Fetching user from Hasura with email:", credentials.email);
          const data: { users: AuthUser[] } = await client.request(FIND_USER_BY_EMAIL, {
            email: credentials.email,
          });
          console.log("Hasura response data:", data);

          const user = data.users[0];
          if (!user) {
            console.log("User not found in database.");
            return null;
          }
          console.log("User found:", user);

          console.log("Comparing password with stored hash...");
          const valid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!valid) {
            console.log("Password comparison failed. Passwords do not match.");
            return null;
          }
          console.log("Password is valid.");

          console.log("Authorization successful. Returning user object.");
          return {
            id: user.id,
            email: user.email,
            role: user.defaultRole, // Use defaultRole directly
            name: user.displayName,
          };
        } catch (error) {
          console.error("Error in authorize function:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // The user object is only available on the first sign-in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;

        // Generate Hasura-compatible JWT
        const jwtSecretObject = JSON.parse(process.env.HASURA_GRAPHQL_JWT_SECRET!);
        if (!jwtSecretObject || !jwtSecretObject.key) {
          throw new Error("JWT Secret Key is not configured correctly.");
        }

        const claims = {
          "https://hasura.io/jwt/claims": {
            "x-hasura-allowed-roles": [user.role, "user"],
            "x-hasura-default-role": user.role,
            "x-hasura-user-id": user.id,
          },
          iat: Math.floor(Date.now() / 1000) - 30,
        };

        const hasuraToken = jwt.sign(claims, jwtSecretObject.key, {
          algorithm: 'HS256',
          expiresIn: '1d',
        });

        token.hasuraToken = hasuraToken;
      }
      return token;
    },

    async session({ session, token }) {
      // Pass all properties from the JWT token to the session
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.hasuraToken = token.hasuraToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
