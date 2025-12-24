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

import { IconColor, type IconColorType } from './enums/iconColor'
import { IconName, type IconNameType } from './enums/iconName'
import { IconSize, type IconSizeType } from './enums/iconSize'
import { IconBlockCreateInput, IconBlockUpdateInput } from './inputs'

export const IconBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'IconBlock',
  isTypeOf: (obj: any) => obj.typename === 'IconBlock',
  shareable: true,
  fields: (t) => ({
    name: t.field({
      type: IconName,
      nullable: true,
      resolve: (block) => block.name as IconNameType
    }),
    color: t.field({
      type: IconColor,
      nullable: true,
      resolve: (block) => block.color as IconColorType
    }),
    size: t.field({
      type: IconSize,
      nullable: true,
      resolve: (block) => block.size as IconSizeType
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

// IconBlock Mutations
builder.mutationField('iconBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: IconBlock,
    nullable: false,
    args: {
      input: t.arg({ type: IconBlockCreateInput, required: true })
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
        throw new GraphQLError('user is not allowed to create icon block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const parentOrder = await getNextParentOrder(
          input.journeyId,
          input.parentBlockId
        )

        const blockData = {
          id: input.id ?? uuidv4(),
          journeyId: input.journeyId,
          typename: 'IconBlock',
          parentBlockId: input.parentBlockId,
          parentOrder,
          name: input.name,
          color: input.color,
          size: input.size
        }

        const iconBlock = await tx.block.create({
          data: blockData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: input.journeyId },
          data: { updatedAt: new Date() }
        })

        return iconBlock
      })
    }
  })
)

builder.mutationField('iconBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: IconBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: IconBlockUpdateInput, required: true }),
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
        throw new GraphQLError('icon block not found', {
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
        throw new GraphQLError('user is not allowed to update icon block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (input.name !== undefined) updateData.name = input.name
        if (input.color !== undefined) updateData.color = input.color
        if (input.size !== undefined) updateData.size = input.size

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
