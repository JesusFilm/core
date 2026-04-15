import { GraphQLError } from 'graphql'
import slugify from 'slugify'

import { builder } from '../../builder'
import { authorizeBlockUpdate, update } from '../service'

import { StepBlockUpdateInput } from './inputs'
import { StepBlock } from './step'

builder.mutationField('stepBlockUpdate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: StepBlock,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: StepBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input: initialInput } = args
      const input = { ...initialInput }

      await authorizeBlockUpdate(id, context.user)

      if (id === input.nextBlockId) {
        throw new GraphQLError(
          'nextBlockId cannot be the current step block id',
          { extensions: { code: 'BAD_USER_INPUT' } }
        )
      }

      if (input.slug != null) {
        input.slug = slugify(input.slug, { lower: true, strict: true })
      }

      return await update(id, { ...input })
    }
  })
)
