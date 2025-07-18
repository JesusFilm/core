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

import { GridAlignItems, type GridAlignItemsType } from './enums/gridAlignItems'
import { GridDirection, type GridDirectionType } from './enums/gridDirection'
import {
  GridJustifyContent,
  type GridJustifyContentType
} from './enums/gridJustifyContent'

// Input types for GridContainerBlock operations
const GridContainerBlockCreateInput = builder.inputType(
  'GridContainerBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      gap: t.int({ required: false }),
      direction: t.field({ type: GridDirection, required: false }),
      justifyContent: t.field({ type: GridJustifyContent, required: false }),
      alignItems: t.field({ type: GridAlignItems, required: false })
    })
  }
)

const GridContainerBlockUpdateInput = builder.inputType(
  'GridContainerBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      gap: t.int({ required: false }),
      direction: t.field({ type: GridDirection, required: false }),
      justifyContent: t.field({ type: GridJustifyContent, required: false }),
      alignItems: t.field({ type: GridAlignItems, required: false })
    })
  }
)

export const GridContainerBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'GridContainerBlock',
  isTypeOf: (obj: any) => obj.typename === 'GridContainerBlock',
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
    gap: t.int({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.gap ?? 0
    }),
    direction: t.field({
      type: GridDirection,
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => (block.direction as GridDirectionType) ?? 'column'
    }),
    justifyContent: t.field({
      type: GridJustifyContent,
      nullable: false,
      directives: { shareable: true },
      resolve: (block) =>
        (block.justifyContent as GridJustifyContentType) ?? 'flexStart'
    }),
    alignItems: t.field({
      type: GridAlignItems,
      nullable: false,
      directives: { shareable: true },
      resolve: (block) =>
        (block.alignItems as GridAlignItemsType) ?? 'flexStart'
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
builder.mutationField('gridContainerBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: GridContainerBlock,
    nullable: false,
    args: {
      input: t.arg({ type: GridContainerBlockCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const {
        id,
        journeyId,
        parentBlockId,
        gap,
        direction,
        justifyContent,
        alignItems
      } = input

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
            typename: 'GridContainerBlock',
            journeyId,
            parentBlockId,
            parentOrder,
            gap: gap ?? 0,
            direction: direction ?? 'column',
            justifyContent: justifyContent ?? 'flexStart',
            alignItems: alignItems ?? 'flexStart'
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

builder.mutationField('gridContainerBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: GridContainerBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: GridContainerBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      const { parentBlockId, gap, direction, justifyContent, alignItems } =
        input

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

        if (gap !== undefined) {
          updateData.gap = gap
        }

        if (direction !== undefined) {
          updateData.direction = direction
        }

        if (justifyContent !== undefined) {
          updateData.justifyContent = justifyContent
        }

        if (alignItems !== undefined) {
          updateData.alignItems = alignItems
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
