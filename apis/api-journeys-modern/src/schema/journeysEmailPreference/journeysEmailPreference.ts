import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { JourneysEmailPreference } from '.prisma/api-journeys-modern-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

// Email validation schema
const emailSchema = z.object({
  email: z.string().email('Invalid email format')
})

// Input types
const JourneysEmailPreferenceUpdateInput = builder.inputType(
  'JourneysEmailPreferenceUpdateInput',
  {
    fields: (t) => ({
      email: t.string({ required: true }),
      preference: t.string({ required: true }),
      value: t.boolean({ required: true })
    })
  }
)

// JourneysEmailPreference object type
const JourneysEmailPreferenceRef = builder.prismaObject(
  'JourneysEmailPreference',
  {
    fields: (t) => ({
      email: t.exposeString('email'),
      unsubscribeAll: t.exposeBoolean('unsubscribeAll'),
      accountNotifications: t.exposeBoolean('accountNotifications')
    })
  }
)

// Query: journeysEmailPreference - Get email preference by email
builder.queryField('journeysEmailPreference', (t) =>
  t.field({
    type: JourneysEmailPreferenceRef,
    nullable: true,
    args: {
      email: t.arg({ type: 'String', required: true })
    },
    resolve: async (_parent, args) => {
      const { email } = args

      // Validate email format
      try {
        emailSchema.parse({ email })
      } catch (error) {
        throw new GraphQLError('Invalid email format', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      return await prisma.journeysEmailPreference.findUnique({
        where: { email }
      })
    }
  })
)

// Mutation: updateJourneysEmailPreference - Update or create email preference
builder.mutationField('updateJourneysEmailPreference', (t) =>
  t.field({
    type: JourneysEmailPreferenceRef,
    nullable: true,
    args: {
      input: t.arg({ type: JourneysEmailPreferenceUpdateInput, required: true })
    },
    resolve: async (_parent, args) => {
      const { input } = args
      const { email, preference, value } = input

      // Validate email format
      try {
        emailSchema.parse({ email })
      } catch (error) {
        throw new GraphQLError('Invalid email format', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      // Validate preference field
      const validPreferences = ['unsubscribeAll', 'accountNotifications']
      if (!validPreferences.includes(preference)) {
        throw new GraphQLError(
          `Invalid preference field: ${preference}. Must be one of: ${validPreferences.join(', ')}`,
          {
            extensions: { code: 'BAD_USER_INPUT' }
          }
        )
      }

      // Update or create preference using dynamic field update
      const updateData: Record<string, boolean> = {
        [preference]: value
      }

      const updatedJourneysEmailPreference =
        await prisma.journeysEmailPreference.upsert({
          where: { email },
          update: updateData,
          create: {
            email,
            ...updateData
          }
        })

      return updatedJourneysEmailPreference
    }
  })
)
