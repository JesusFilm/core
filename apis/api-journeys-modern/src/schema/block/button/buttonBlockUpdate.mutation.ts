import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../../lib/auth/fetchBlockWithJourneyAcl'
import { builder } from '../../builder'
import { update } from '../service'

import { ButtonBlock } from './button'
import { ButtonBlockUpdateInput } from './inputs'

async function validateBlock(
  id: string | null | undefined,
  parentBlockId: string
): Promise<boolean> {
  if (id == null) return false
  const block = await prisma.block.findUnique({
    where: { id, deletedAt: null }
  })
  return block != null && block.parentBlockId === parentBlockId
}

builder.mutationField('buttonBlockUpdate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .field({
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

        const block = await fetchBlockWithJourneyAcl(id)

        if (
          !ability(
            Action.Update,
            abilitySubject('Journey', block.journey),
            context.user
          )
        ) {
          throw new GraphQLError('user is not allowed to update block', {
            extensions: { code: 'FORBIDDEN' }
          })
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
