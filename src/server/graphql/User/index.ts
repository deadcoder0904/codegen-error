import { User } from 'nexus-prisma'
import { extendType, nonNull, objectType, stringArg } from 'nexus'
import prisma from '@/server/db/prisma'

const UserType = objectType({
  name: User.$name,
  description: User.$description,
  definition(t) {
    t.field(User.id)
    t.field(User.name)
    t.field(User.email)
  },
})

const queries = extendType({
  type: 'Query',
  definition: (t) => {
    t.field('currentUser', {
      type: 'User',
      resolve: (_, __, ctx) => {
        if (!ctx.user?.id) return null

        return prisma.user.findUnique({
          where: {
            id: ctx.user.id,
          },
        })
      },
    })
  },
})

const mutations = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.nullable.field('createUser', {
      type: 'User',
      args: {
        userId: nonNull(stringArg()),
        name: nonNull(stringArg()),
        email: nonNull(stringArg()),
      },
      resolve: async (_, { userId, name, email }, ctx) => {
        if (!ctx.user?.id || userId !== ctx.user.id) return null

        return await prisma.user.create({
          data: { name, email },
        })
      },
    })
    t.nullable.field('updateUser', {
      type: 'User',
      args: {
        userId: nonNull(stringArg()),
        name: stringArg(),
        email: stringArg(),
      },
      resolve: async (_, { userId, name, email }, ctx) => {
        if (!ctx.user?.id || userId !== ctx.user.id) return null

        return await prisma.user.update({
          where: { id: userId },
          data: { name, email },
        })
      },
    })
  },
})

export default [UserType, mutations, queries]
