import {
  type Prisma,
  UserMediaProfile as PrismaUserMediaProfile,
  prisma
} from '@core/prisma/media/client'

import { builder } from '../builder'
import { Language } from '../language'

import { UserMediaProfileUpdateInput } from './inputs/userMediaProfileUpdate'

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
      description: 'Language IDs array related to IDs in api-languages',
      resolve: (parent: PrismaUserMediaProfile) =>
        parent.languageInterestIds.map((id) => ({ id }))
    }),
    countryInterests: t.exposeIDList('countryInterestIds', {
      nullable: true,
      description: 'Country IDs array'
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
      const userMediaProfile = await prisma.userMediaProfile.findUnique({
        ...query,
        where: { userId: user.id }
      })

      if (userMediaProfile == null)
        return await prisma.userMediaProfile.upsert({
          ...query,
          where: { userId: user.id },
          update: {},
          create: { userId: user.id }
        })

      return userMediaProfile
    }
  })
)

builder.mutationField('userMediaProfileUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'UserMediaProfile',
    nullable: false,
    args: {
      input: t.arg({ type: UserMediaProfileUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }, { user }) => {
      const dataUpdate: Prisma.UserMediaProfileUpdateInput = {}
      const dataCreate: Prisma.UserMediaProfileCreateInput = { userId: user.id }

      if (input?.languageInterestIds) {
        dataUpdate.languageInterestIds = input.languageInterestIds
        dataCreate.languageInterestIds = input.languageInterestIds
      }

      if (input?.countryInterestIds) {
        dataUpdate.countryInterestIds = input.countryInterestIds
        dataCreate.countryInterestIds = input.countryInterestIds
      }

      if (input?.userInterestIds != null) {
        dataUpdate.userInterests = {
          set: input.userInterestIds.map((id) => ({ id }))
        }
        dataCreate.userInterests = {
          connect: input.userInterestIds.map((id) => ({ id }))
        }
      }

      return await prisma.userMediaProfile.upsert({
        ...query,
        where: { userId: user.id },
        update: dataUpdate,
        create: dataCreate
      })
    }
  })
)
