import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { authorizeBlockUpdate, update, validateParentBlock } from '../service'

import { ButtonBlock } from './button'
import { ButtonBlockUpdateInput } from './inputs'

async function validateBlock(
  id: string | null | undefined,
  parentBlockId: string
): Promise<boolean> {
  if (id == null) return false
  const block = await prisma.block.findFirst({
    where: { id, parentBlockId, deletedAt: null }
  })
  return block != null
}

builder.mutationField('buttonBlockUpdate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: ButtonBlock,
    nullable: true,
    override: {
      from: 'api-journeys'
    },
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: ButtonBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input: initialInput } = args
      const input = { ...initialInput }

      const block = await authorizeBlockUpdate(id, context.user)

      if (input.parentBlockId != null) {
        await validateParentBlock(input.parentBlockId, block.journeyId)
      }

      if (input.startIconId != null) {
        if (!(await validateBlock(input.startIconId, id))) {
          throw new GraphQLError('Start icon does not exist', {
            extensions: { code: 'BAD_USER_INPUT' }
          })
        }
      }

      if (input.endIconId != null) {
        if (!(await validateBlock(input.endIconId, id))) {
          throw new GraphQLError('End icon does not exist', {
            extensions: { code: 'BAD_USER_INPUT' }
          })
        }
      }

      return await update(id, {
        ...input,
        settings:
          input.settings != null
            ? {
                ...((block.settings ?? {}) as Prisma.JsonObject),
                ...(input.settings as Prisma.JsonObject)
              }
            : undefined
      })
    }
  })
)
