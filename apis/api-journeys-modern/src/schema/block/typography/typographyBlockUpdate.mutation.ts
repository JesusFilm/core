import { Prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { authorizeBlockUpdate, update } from '../service'

import { TypographyBlockUpdateInput } from './inputs'
import { TypographyBlock } from './typography'

builder.mutationField('typographyBlockUpdate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: TypographyBlock,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: TypographyBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeBlockUpdate(id, context.user)

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
