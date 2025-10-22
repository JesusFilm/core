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
  ButtonColor,
  type ButtonColorType,
  ButtonSize,
  type ButtonSizeType,
  ButtonVariant,
  type ButtonVariantType
} from './enums'
import {
  ButtonAlignment,
  type ButtonAlignmentType
} from './enums/buttonAlignment'
import { ButtonBlockCreateInput, ButtonBlockUpdateInput } from './inputs'

interface ButtonBlockSettingsType {
  alignment: ButtonAlignmentType
  color: string
}

const ButtonBlockSettings = builder.objectType(
  builder.objectRef<ButtonBlockSettingsType>('ButtonBlockSettings'),
  {
    shareable: true,
    fields: (t) => ({
      alignment: t.field({
        type: ButtonAlignment,
        nullable: true,
        description: 'Alignment of the button',
        resolve: (settings: ButtonBlockSettingsType) => settings.alignment
      }),
      color: t.string({
        nullable: true,
        description: 'Color of the button',
        resolve: (settings: ButtonBlockSettingsType) => settings.color
      })
    })
  }
)

export const ButtonBlock = builder.prismaObject('Block', {
  variant: 'ButtonBlock',
  interfaces: [Block],
  isTypeOf: (obj: any) => obj.typename === 'ButtonBlock',
  shareable: true,
  fields: (t) => ({
    label: t.string({
      nullable: false,
      resolve: (block) => block.label ?? ''
    }),
    variant: t.field({
      type: ButtonVariant,
      nullable: true,
      resolve: (block) => block.variant as ButtonVariantType
    }),
    color: t.field({
      type: ButtonColor,
      nullable: true,
      resolve: (block) => block.color as ButtonColorType
    }),
    size: t.field({
      type: ButtonSize,
      nullable: true,
      resolve: (block) => block.size as ButtonSizeType
    }),
    startIconId: t.exposeID('startIconId', {
      nullable: true
    }),
    endIconId: t.exposeID('endIconId', {
      nullable: true
    }),
    submitEnabled: t.exposeBoolean('submitEnabled', {
      nullable: true
    }),
    settings: t.field({
      type: ButtonBlockSettings,
      nullable: true,
      select: {
        settings: true
      },
      resolve: ({ settings }) => settings as unknown as ButtonBlockSettingsType
    }),
    action: t.relation('action', {
      nullable: true
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

// ButtonBlock Mutations
builder.mutationField('buttonBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: ButtonBlock,
    nullable: false,
    args: {
      input: t.arg({ type: ButtonBlockCreateInput, required: true })
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
        throw new GraphQLError('user is not allowed to create button block', {
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
          typename: 'ButtonBlock',
          parentBlockId: input.parentBlockId,
          parentOrder,
          label: input.label,
          variant: input.variant,
          color: input.color,
          size: input.size,
          submitEnabled: input.submitEnabled ?? false,
          settings: input.settings as any
        }

        const buttonBlock = await tx.block.create({
          data: blockData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: input.journeyId },
          data: { updatedAt: new Date() }
        })

        return buttonBlock
      })
    }
  })
)

builder.mutationField('buttonBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: ButtonBlock,
    nullable: false,
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
      const { id, input } = args

      const blockWithJourney = await fetchBlockWithJourneyAcl(id)
      if (!blockWithJourney) {
        throw new GraphQLError('button block not found', {
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
        throw new GraphQLError('user is not allowed to update button block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (input.parentBlockId !== undefined)
          updateData.parentBlockId = input.parentBlockId
        if (input.label !== undefined) updateData.label = input.label
        if (input.variant !== undefined) updateData.variant = input.variant
        if (input.color !== undefined) updateData.color = input.color
        if (input.size !== undefined) updateData.size = input.size
        if (input.startIconId !== undefined)
          updateData.startIconId = input.startIconId
        if (input.endIconId !== undefined)
          updateData.endIconId = input.endIconId
        if (input.submitEnabled !== undefined)
          updateData.submitEnabled = input.submitEnabled
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
