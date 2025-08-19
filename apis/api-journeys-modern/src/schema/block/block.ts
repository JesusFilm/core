import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../lib/auth/ability'
import { builder } from '../builder'

export const Block = builder.prismaInterface('Block', {
  name: 'Block',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    journeyId: t.exposeID('journeyId', {
      nullable: false
    }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true
    })
  }),
  resolveType: (obj) => {
    return obj.typename
  }
})

// Input types for block operations
const BlocksFilter = builder.inputType('BlocksFilter', {
  fields: (t) => ({
    journeyIds: t.idList({ required: false }),
    typenames: t.stringList({ required: false })
  })
})

const BlockDuplicateIdMap = builder.inputType('BlockDuplicateIdMap', {
  fields: (t) => ({
    oldId: t.id({ required: true }),
    newId: t.id({ required: true })
  })
})

// Helper function to fetch journey with ACL includes for block operations
async function fetchJourneyWithAclIncludes(journeyId: string) {
  return await prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      userJourneys: true,
      team: {
        include: { userTeams: true }
      }
    }
  })
}

// Helper function to fetch block with journey ACL includes
async function fetchBlockWithJourneyAcl(blockId: string) {
  return await prisma.block.findUnique({
    where: { id: blockId, deletedAt: null },
    include: {
      action: true,
      journey: {
        include: {
          userJourneys: true,
          team: {
            include: { userTeams: true }
          }
        }
      }
    }
  })
}

// Core Block Queries
builder.queryField('blocks', (t) =>
  t.field({
    type: [Block],
    nullable: false,
    args: {
      where: t.arg({ type: BlocksFilter, required: false })
    },
    resolve: async (_parent, args) => {
      const { where } = args

      const filter: Prisma.BlockWhereInput = {
        deletedAt: null
      }

      if (where?.journeyIds) {
        filter.journeyId = { in: where.journeyIds }
      }

      if (where?.typenames) {
        filter.typename = { in: where.typenames }
      }

      return await prisma.block.findMany({
        where: filter,
        orderBy: { parentOrder: 'asc' }
      })
    }
  })
)

builder.queryField('block', (t) =>
  t.field({
    type: Block,
    nullable: true,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args) => {
      const { id } = args

      return await prisma.block.findUnique({
        where: { id, deletedAt: null }
      })
    }
  })
)

// Core Block Mutations
builder.mutationField('blockDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [Block],
    nullable: false,
    description:
      'blockDelete returns the updated sibling blocks on successful delete',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      }),
      parentBlockId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args

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
        throw new GraphQLError('user is not allowed to delete block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        // Soft delete the block
        await tx.block.update({
          where: { id },
          data: { deletedAt: new Date() }
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: blockWithJourney.journeyId },
          data: { updatedAt: new Date() }
        })

        // Return updated siblings
        const siblings = await tx.block.findMany({
          where: {
            journeyId: blockWithJourney.journeyId,
            parentBlockId: blockWithJourney.parentBlockId,
            deletedAt: null,
            parentOrder: { not: null }
          },
          orderBy: { parentOrder: 'asc' }
        })

        return siblings
      })
    }
  })
)

builder.mutationField('blockDuplicate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [Block],
    nullable: false,
    description:
      'blockDuplicate returns the updated block, its children and sibling blocks on successful duplicate',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      parentOrder: t.arg({
        type: 'Int',
        required: false,
        description:
          'parentOrder defines the position to add the duplicated block. Negative values defines the position from the end of the array. Positions greater than the length of the array or null parentOrder will add duplicate at end of the array.'
      }),
      idMap: t.arg({
        type: [BlockDuplicateIdMap],
        required: false,
        description:
          'idMap is used to set custom ids for the duplicated block and its descendants.'
      }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      }),
      x: t.arg({
        type: 'Int',
        required: false,
        description:
          'x is used to position a step block block horizontally in the journey flow diagram on the editor.'
      }),
      y: t.arg({
        type: 'Int',
        required: false,
        description:
          'y is used to position a step block block vertically in the journey flow diagram on the editor.'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, parentOrder, idMap, x, y } = args

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
        throw new GraphQLError('user is not allowed to duplicate block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const duplicateId = uuidv4()
        const isStepBlock = blockWithJourney.typename === 'StepBlock'

        // TODO: Implement full block duplication logic similar to legacy BlockService
        // For now, create a simple duplicate
        const duplicateData: any = {
          ...blockWithJourney,
          id: duplicateId,
          parentOrder: parentOrder ?? (blockWithJourney.parentOrder ?? 0) + 1
        }

        if (isStepBlock && x !== undefined) {
          duplicateData.x = x
        }
        if (isStepBlock && y !== undefined) {
          duplicateData.y = y
        }

        // Remove fields that shouldn't be duplicated
        delete duplicateData.action
        delete duplicateData.journey
        delete duplicateData.createdAt
        delete duplicateData.updatedAt
        delete duplicateData.deletedAt

        const duplicatedBlock = await tx.block.create({
          data: duplicateData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: blockWithJourney.journeyId },
          data: { updatedAt: new Date() }
        })

        // Return siblings including the new duplicate
        const siblings = await tx.block.findMany({
          where: {
            journeyId: blockWithJourney.journeyId,
            parentBlockId: blockWithJourney.parentBlockId,
            deletedAt: null
          },
          orderBy: { parentOrder: 'asc' }
        })

        return siblings
      })
    }
  })
)

builder.mutationField('blockOrderUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [Block],
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      parentOrder: t.arg({ type: 'Int', required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, parentOrder } = args

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
        throw new GraphQLError('user is not allowed to update block order', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        // Update the block's parent order
        await tx.block.update({
          where: { id },
          data: { parentOrder }
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: blockWithJourney.journeyId },
          data: { updatedAt: new Date() }
        })

        // Return updated siblings
        const siblings = await tx.block.findMany({
          where: {
            journeyId: blockWithJourney.journeyId,
            parentBlockId: blockWithJourney.parentBlockId,
            deletedAt: null
          },
          orderBy: { parentOrder: 'asc' }
        })

        return siblings
      })
    }
  })
)

builder.mutationField('blockRestore', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [Block],
    nullable: false,
    description: 'blockRestore is used for redo/undo',
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args

      // Fetch block even if deleted for restore operation
      const blockWithJourney = await prisma.block.findUnique({
        where: { id },
        include: {
          action: true,
          journey: {
            include: {
              userJourneys: true,
              team: {
                include: { userTeams: true }
              }
            }
          }
        }
      })

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
        throw new GraphQLError('user is not allowed to restore block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        // Restore the block by clearing deletedAt
        const restoredBlock = await tx.block.update({
          where: { id },
          data: { deletedAt: null }
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: blockWithJourney.journeyId },
          data: { updatedAt: new Date() }
        })

        // Get all blocks in the journey for children restoration
        const allBlocks = await tx.block.findMany({
          where: {
            journeyId: blockWithJourney.journeyId,
            deletedAt: null,
            NOT: { id: restoredBlock.id }
          }
        })

        // Return the restored block and its potential children
        // TODO: Implement proper descendants restoration like legacy service
        return [
          restoredBlock,
          ...allBlocks.filter((b) => b.parentBlockId === restoredBlock.id)
        ]
      })
    }
  })
)
