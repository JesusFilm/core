import { prisma as prismaLanguages } from '@core/prisma/languages/client'
import {
  type Prisma,
  UserMediaProfile as PrismaUserMediaProfile,
  prisma
} from '@core/prisma/media/client'

import { builder } from '../builder'
import { Language } from '../language'

import { UserMediaProfileCreateInput } from './inputs/userMediaProfileCreate'

export const UserMediaProfile = builder.prismaObject('UserMediaProfile', {
  fields: (t) => ({
    id: t.exposeID('id', {
      nullable: false,
      description: 'The database UUID'
    }),
    userId: t.exposeID('userId', {
      nullable: false,
      description: 'The Firebase user ID'
    }),
    languageInterests: t.field({
      type: [Language],
      nullable: true,
      description:
        'A string array of wess code language IDs related to IDs in api-languages',
      resolve: async (parent: PrismaUserMediaProfile) => {
        return await prismaLanguages.language.findMany({
          where: { id: { in: parent.languageInterestIds } }
        })
      }
    }),
    countryInterests: t.exposeStringList('countryInterestIds', {
      nullable: true,
      description: 'A string array'
    }),
    userInterests: t.relation('userInterests', {
      nullable: true,
      description: 'IDs of video collections the user is interested in'
    })
  })
})

builder.queryField('userMediaProfile', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'UserMediaProfile',
    resolve: async (query, _parent, _args, { user }) => {
      return await prisma.userMediaProfile.findUnique({
        ...query,
        where: { userId: user.id }
      })
    }
  })
)

builder.mutationField('userMediaProfileCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'UserMediaProfile',
    nullable: false,
    args: {
      input: t.arg({ type: UserMediaProfileCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }, { user }) => {
      const userInterestIds = input?.userInterestIds ?? []
      const data = {
        userId: user.id,
        languageInterestIds: input?.languageInterestIds ?? [],
        countryInterestIds: input?.countryInterestIds ?? [],
        userInterests: {
          connect: userInterestIds.map((id: string) => ({ id }))
        }
      }
      return await prisma.userMediaProfile.create({
        ...query,
        data
      })
    }
  })
)

builder.mutationField('userMediaProfileUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'UserMediaProfile',
    nullable: false,
    args: {
      input: t.arg({ type: UserMediaProfileCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }, { user }) => {
      const data: Prisma.UserMediaProfileUpdateInput = {}

      if (input?.languageInterestIds)
        data.languageInterestIds = input.languageInterestIds

      if (input?.countryInterestIds)
        data.countryInterestIds = input.countryInterestIds

      if (input?.userInterestIds != null)
        data.userInterests = {
          set: input.userInterestIds.map((id) => ({ id }))
        }

      return await prisma.userMediaProfile.update({
        ...query,
        where: { userId: user.id },
        data
      })
    }
  })
)
