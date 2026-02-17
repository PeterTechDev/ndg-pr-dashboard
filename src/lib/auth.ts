import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth: session, request }) {
      const isLoggedIn = !!session?.user;
      const isLoginPage = request.nextUrl.pathname.startsWith("/login");
      if (isLoginPage) return true; // always allow login page
      return isLoggedIn; // redirect to signIn page if not logged in
    },
    signIn({ profile }) {
      const email = profile?.email;
      if (!email || !email.endsWith("@ndgcommunications.com")) {
        return "/login?error=AccessDenied";
      }
      return true;
    },
    session({ session }) {
      return session;
    },
  },
});
