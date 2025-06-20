import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    organizationId?: string
    organization?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      organizationId: string
      organization: string
    }
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    organizationId?: string
    organization?: string
    accessToken?: string
    refreshToken?: string
  }
}