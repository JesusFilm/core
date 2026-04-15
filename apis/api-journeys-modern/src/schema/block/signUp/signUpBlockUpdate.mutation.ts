import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { authorizeBlockUpdate, update } from '../service'

import { SignUpBlockUpdateInput } from './inputs'
import { SignUpBlock } from './signUp'

builder.mutationField('signUpBlockUpdate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: SignUpBlock,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: SignUpBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args

      if (input.submitIconId != null) {
        const submitIcon = await prisma.block.findUnique({
          where: { id: input.submitIconId, deletedAt: null }
        })
        if (submitIcon == null || submitIcon.parentBlockId !== id) {
          throw new GraphQLError('Submit icon does not exist', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
      }

      await authorizeBlockUpdate(id, context.user)
      return await update(id, { ...input })
    }
  })
)
