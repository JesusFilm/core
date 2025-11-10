import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { getIntegrationGoogleAccessToken } from '../../../lib/google/googleAuth'
import { builder } from '../../builder'

builder.queryField('integrationGooglePickerToken', (t) =>
  t
    .withAuth((_parent, args) => ({
      $all: {
        isAuthenticated: true,
        isIntegrationOwner: args.integrationId
      }
    }))
    .string({
      args: {
        integrationId: t.arg.id({ required: true })
      },
      nullable: false,
      resolve: async (_parent, { integrationId }, context) => {
        const integration = await prisma.integration.findUnique({
          where: { id: integrationId }
        })
        if (integration == null)
          throw new GraphQLError('Integration not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        if (integration.type !== 'google')
          throw new GraphQLError('Integration is not a Google integration', {
            extensions: { code: 'BAD_REQUEST' }
          })
        const token = await getIntegrationGoogleAccessToken(integration.id)
        return token.accessToken
      }
    })
)
