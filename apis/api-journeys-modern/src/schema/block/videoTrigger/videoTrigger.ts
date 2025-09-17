import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { ActionInterface } from '../../action/action'
import { builder } from '../../builder'
import { Block } from '../block'

import {
  VideoTriggerBlockCreateInput,
  VideoTriggerBlockUpdateInput
} from './inputs'

export const VideoTriggerBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'VideoTriggerBlock',
  isTypeOf: (obj: any) => obj.typename === 'VideoTriggerBlock',
  shareable: true,
  fields: (t) => ({
    triggerStart: t.int({
      nullable: false,
      description: `triggerStart sets the time as to when a video navigates to the next block,
this is the number of seconds since the start of the video`,
      resolve: (block) => block.triggerStart ?? 0
    }),
    action: t.relation('action', {
      nullable: false,
      onNull: () => new GraphQLError('Action not found')
    })
  })
})

// Helper function to fetch journey with ACL includes
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

// Helper function to get next parent order
async function getNextParentOrder(journeyId: string, parentBlockId: string) {
  const siblings = await prisma.block.findMany({
    where: {
      journeyId,
      parentBlockId,
      deletedAt: null,
      parentOrder: { not: null }
    },
    orderBy: { parentOrder: 'desc' },
    take: 1
  })

  return (siblings[0]?.parentOrder ?? -1) + 1
}

// VideoTriggerBlock Mutations
builder.mutationField('videoTriggerBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: VideoTriggerBlock,
    nullable: false,
    args: {
      input: t.arg({ type: VideoTriggerBlockCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args

      const journey = await fetchJourneyWithAclIncludes(input.journeyId)
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
        throw new GraphQLError(
          'user is not allowed to create video trigger block',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      return await prisma.$transaction(async (tx) => {
        const parentOrder = await getNextParentOrder(
          input.journeyId,
          input.parentBlockId
        )

        const blockData = {
          id: input.id ?? uuidv4(),
          journeyId: input.journeyId,
          typename: 'VideoTriggerBlock',
          parentBlockId: input.parentBlockId,
          parentOrder,
          triggerStart: input.triggerStart ?? 0
        }

        const videoTriggerBlock = await tx.block.create({
          data: blockData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: input.journeyId },
          data: { updatedAt: new Date() }
        })

        return videoTriggerBlock
      })
    }
  })
)

builder.mutationField('videoTriggerBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: VideoTriggerBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: VideoTriggerBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args

      const blockWithJourney = await fetchBlockWithJourneyAcl(id)
      if (!blockWithJourney) {
        throw new GraphQLError('video trigger block not found', {
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
        throw new GraphQLError(
          'user is not allowed to update video trigger block',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (input.triggerStart !== undefined)
          updateData.triggerStart = input.triggerStart

        const updatedBlock = await tx.block.update({
          where: { id },
          data: updateData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: blockWithJourney.journeyId },
          data: { updatedAt: new Date() }
        })

        return updatedBlock
      })
    }
  })
)
