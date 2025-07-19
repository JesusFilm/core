import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { Block } from '../block'

// Input types for GridItemBlock operations
const GridItemBlockCreateInput = builder.inputType('GridItemBlockCreateInput', {
  fields: (t) => ({
    id: t.id({ required: false }),
    journeyId: t.id({ required: true }),
    parentBlockId: t.id({ required: true }),
    xl: t.int({ required: false }),
    lg: t.int({ required: false }),
    sm: t.int({ required: false })
  })
})

const GridItemBlockUpdateInput = builder.inputType('GridItemBlockUpdateInput', {
  fields: (t) => ({
    parentBlockId: t.id({ required: false }),
    xl: t.int({ required: false }),
    lg: t.int({ required: false }),
    sm: t.int({ required: false })
  })
})

export const GridItemBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'GridItemBlock',
  isTypeOf: (obj: any) => obj.typename === 'GridItemBlock',
  directives: { key: { fields: 'id' } },
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', {
      nullable: false,
      directives: { shareable: true }
    }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    xl: t.int({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.xl ?? 12
    }),
    lg: t.int({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.lg ?? 12
    }),
    sm: t.int({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.sm ?? 12
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
builder.mutationField('gridItemBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: GridItemBlock,
    nullable: false,
    args: {
      input: t.arg({ type: GridItemBlockCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { id, journeyId, parentBlockId, xl, lg, sm } = input

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
            typename: 'GridItemBlock',
            journeyId,
            parentBlockId,
            parentOrder,
            xl: xl ?? 12,
            lg: lg ?? 12,
            sm: sm ?? 12
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

builder.mutationField('gridItemBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: GridItemBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: GridItemBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      const { parentBlockId, xl, lg, sm } = input

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

        if (xl !== undefined) {
          updateData.xl = xl
        }

        if (lg !== undefined) {
          updateData.lg = lg
        }

        if (sm !== undefined) {
          updateData.sm = sm
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
