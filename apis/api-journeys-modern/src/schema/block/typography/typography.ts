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

import {
  TypographyAlign,
  type TypographyAlignType
} from './enums/typographyAlign'
import {
  TypographyColor,
  type TypographyColorType
} from './enums/typographyColor'
import {
  TypographyVariant,
  type TypographyVariantType
} from './enums/typographyVariant'
import {
  TypographyBlockCreateInput,
  TypographyBlockUpdateInput
} from './inputs'

interface TypographyBlockSettingsType {
  color: string | null
}

const TypographyBlockSettingsRef =
  builder.objectRef<TypographyBlockSettingsType>('TypographyBlockSettings')

const TypographyBlockSettings = builder.objectType(TypographyBlockSettingsRef, {
  shareable: true,
  fields: (t) => ({
    color: t.string({
      nullable: true,
      description: 'Color of the typography',
      resolve: (settings: TypographyBlockSettingsType) => settings.color
    })
  })
})

export const TypographyBlock = builder.prismaObject('Block', {
  variant: 'TypographyBlock',
  interfaces: [Block],
  isTypeOf: (obj: any) => obj.typename === 'TypographyBlock',
  shareable: true,
  fields: (t) => ({
    content: t.string({
      nullable: false,
      resolve: (block) => block.content ?? ''
    }),
    variant: t.field({
      type: TypographyVariant,
      nullable: true,
      resolve: (block) => block.variant as TypographyVariantType
    }),
    color: t.field({
      type: TypographyColor,
      nullable: true,
      resolve: (block) => block.color as TypographyColorType
    }),
    align: t.field({
      type: TypographyAlign,
      nullable: true,
      resolve: (block) => block.align as TypographyAlignType
    }),
    settings: t.field({
      type: TypographyBlockSettings,
      nullable: true,
      resolve: ({ settings }) =>
        settings as unknown as TypographyBlockSettingsType
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

// TypographyBlock Mutations
builder.mutationField('typographyBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: TypographyBlock,
    nullable: false,
    args: {
      input: t.arg({ type: TypographyBlockCreateInput, required: true })
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
          'user is not allowed to create typography block',
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
          typename: 'TypographyBlock',
          parentBlockId: input.parentBlockId,
          parentOrder,
          content: input.content,
          variant: input.variant,
          color: input.color,
          align: input.align,
          settings: input.settings as any
        }

        const typographyBlock = await tx.block.create({
          data: blockData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: input.journeyId },
          data: { updatedAt: new Date() }
        })

        return typographyBlock
      })
    }
  })
)

builder.mutationField('typographyBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: TypographyBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: TypographyBlockUpdateInput, required: true }),
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
        throw new GraphQLError('typography block not found', {
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
          'user is not allowed to update typography block',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (input.parentBlockId !== undefined)
          updateData.parentBlockId = input.parentBlockId
        if (input.content !== undefined) updateData.content = input.content
        if (input.variant !== undefined) updateData.variant = input.variant
        if (input.color !== undefined) updateData.color = input.color
        if (input.align !== undefined) updateData.align = input.align
        if (input.settings !== undefined)
          updateData.settings = input.settings as any

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
