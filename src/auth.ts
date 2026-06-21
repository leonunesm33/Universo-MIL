import NextAuth from 'next-auth'
import type { AppRole } from '@/types/next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET!

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Email e Senha',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) return null
        if (user.blocked) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!valid) return null

        await prisma.loginLog.create({ data: { userId: user.id } })
        await prisma.user.update({
          where: { id: user.id },
          data: { lastAccessAt: new Date() },
        })

        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),

    Credentials({
      id: 'cpf',
      name: 'CPF',
      credentials: {
        cpf: { label: 'CPF', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.cpf || !credentials?.password) return null

        const cpf = (credentials.cpf as string).replace(/\D/g, '')
        const user = await prisma.user.findUnique({ where: { cpf } })

        if (!user || !user.passwordHash) return null
        if (user.blocked) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!valid) return null

        await prisma.loginLog.create({ data: { userId: user.id } })
        await prisma.user.update({
          where: { id: user.id },
          data: { lastAccessAt: new Date() },
        })

        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),

    // Used by magic-link and invite flows — token is a signed JWT with { userId, purpose }
    Credentials({
      id: 'magic-link',
      name: 'Magic Link',
      credentials: {
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null
        try {
          const payload = jwt.verify(credentials.token as string, JWT_SECRET) as {
            userId: string
            purpose: string
          }
          if (!['magic-link', 'invite'].includes(payload.purpose)) return null

          const user = await prisma.user.findUnique({ where: { id: payload.userId } })
          if (!user || user.blocked) return null

          await prisma.loginLog.create({ data: { userId: user.id } })
          await prisma.user.update({
            where: { id: user.id },
            data: { lastAccessAt: new Date() },
          })

          return { id: user.id, name: user.name, email: user.email, role: user.role }
        } catch {
          return null
        }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role as AppRole
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as AppRole
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
  },
})
