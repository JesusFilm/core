import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { builder } from '../../builder'
import { Block } from '../block'

import { RadioQuestionBlockCreateInput } from './inputs'

export const RadioQuestionBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'RadioQuestionBlock',
  isTypeOf: (obj: any) => obj.typename === 'RadioQuestionBlock',
  shareable: true,
  fields: (t) => ({
    gridView: t.exposeBoolean('gridView', {
      nullable: true
    })
  })
})

// Helper functions
async function fetchJourneyWithAclIncludes(journeyId: string) {
  return prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      team: { include: { userTeams: true } },
      userJourneys: true
    }
  })
}

async function fetchBlockWithJourneyAcl(blockId: string) {
  return prisma.block.findUnique({
    where: { id: blockId, deletedAt: null },
    include: {
      journey: {
        include: {
          team: { include: { userTeams: true } },
          userJourneys: true
        }
      }
    }
  })
}

async function getNextParentOrder(
  journeyId: string,
  parentBlockId: string
): Promise<number> {
  const siblings = await prisma.block.findMany({
    where: {
      journeyId,
      parentBlockId,
      deletedAt: null
    },
    orderBy: { parentOrder: 'desc' },
    take: 1
  })

  return siblings.length > 0 ? (siblings[0].parentOrder ?? 0) + 1 : 0
}

// Mutations
builder.mutationField('radioQuestionBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: RadioQuestionBlock,
    nullable: false,
    args: {
      input: t.arg({ type: RadioQuestionBlockCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { id, journeyId, parentBlockId } = input

      const journey = await fetchJourneyWithAclIncludes(journeyId)
      if (!journey) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check permissions using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to create block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const parentOrder = await getNextParentOrder(journeyId, parentBlockId)

        const block = await tx.block.create({
          data: {
            id: id ?? uuidv4(),
            typename: 'RadioQuestionBlock',
            journeyId,
            parentBlockId,
            parentOrder
          }
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: journeyId },
          data: { updatedAt: new Date() }
        })

        return block
      })
    }
  })
)

builder.mutationField('radioQuestionBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: RadioQuestionBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      parentBlockId: t.arg({ type: 'ID', required: true }),
      gridView: t.arg({ type: 'Boolean', required: false })
    },
    resolve: async (_parent, args, context) => {
      const { id, parentBlockId, gridView } = args

      const blockWithJourney = await fetchBlockWithJourneyAcl(id)
      if (!blockWithJourney) {
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check permissions using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', blockWithJourney.journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (parentBlockId !== undefined) {
          updateData.parentBlockId = parentBlockId
          if (parentBlockId !== null) {
            updateData.parentOrder = await getNextParentOrder(
              blockWithJourney.journeyId,
              parentBlockId
            )
          }
        }

        const block = await tx.block.update({
          where: { id },
          data: updateData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: blockWithJourney.journeyId },
          data: { updatedAt: new Date() }
        })

        return block
      })
    }
  })
)
