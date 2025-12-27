import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account) token.accessToken = account.access_token;
      return token;
    },
    async session({ session, token }) {
      // @ts-ignore
      session.user.accessToken = token.accessToken;
      return session;
    },
  },
});
