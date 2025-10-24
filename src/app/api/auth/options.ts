import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import UserModel from "@/models/User";
import { dbConnect } from "@/db/connection";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXT_AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user }) {
      try {
        await dbConnect();

        const existingUser = await UserModel.findOne({ email: user.email });
        if (existingUser) {
          user._id = existingUser._id.toString();
          user.role = existingUser.role;
        } else {
          const newUser = new UserModel({
            email: user.email,
            name: user.email?.split("@")[0],
            profilePhoto: user.image,
            role: "admin",
          });
          const res = await newUser.save();
          user._id = res._id.toString();
          user.role = res.role;
        }
        return true;
      } catch (er) {
        console.error("Error occured in loggin in :", er);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
