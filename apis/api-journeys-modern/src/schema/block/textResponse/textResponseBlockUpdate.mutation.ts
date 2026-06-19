import { GraphQLError } from 'graphql'

import { builder } from '../../builder'
import { authorizeBlockUpdate, update } from '../service'

import { TextResponseBlockUpdateInput } from './inputs'
import { TextResponseBlock } from './textResponse'

builder.mutationField('textResponseBlockUpdate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: TextResponseBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: TextResponseBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeBlockUpdate(id, context.user)

      if (
        input.routeId != null &&
        block.integrationId == null &&
        input.integrationId == null
      ) {
        throw new GraphQLError(
          'route is being set but it is not associated to an integration',
          { extensions: { code: 'BAD_USER_INPUT' } }
        )
      }

      return await update(id, { ...input })
    }
  })
)
