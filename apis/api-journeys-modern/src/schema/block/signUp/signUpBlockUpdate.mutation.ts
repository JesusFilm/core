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

      await authorizeBlockUpdate(id, context.user)

      if (input.submitIconId != null) {
        const submitIcon = await prisma.block.findFirst({
          where: {
            id: input.submitIconId,
            parentBlockId: id,
            typename: 'IconBlock',
            deletedAt: null
          }
        })
        if (submitIcon == null) {
          throw new GraphQLError('Submit icon does not exist', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
      }

      return await update(id, { ...input })
    }
  })
)
