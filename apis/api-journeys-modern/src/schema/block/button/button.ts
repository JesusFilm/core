import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { prisma } from '../../../lib/prisma'
import { ActionInterface } from '../../action/action'
import { builder } from '../../builder'
import { Block } from '../block'

import {
  ButtonAlignment,
  type ButtonAlignmentType
} from './enums/buttonAlignment'
import { ButtonColor, type ButtonColorType } from './enums/buttonColor'
import { ButtonSize, type ButtonSizeType } from './enums/buttonSize'
import { ButtonVariant, type ButtonVariantType } from './enums/buttonVariant'

interface ButtonBlockSettingsType {
  alignment: ButtonAlignmentType
  color: string
}

// Input types for ButtonBlock operations
const ButtonBlockSettingsInput = builder.inputType('ButtonBlockSettingsInput', {
  fields: (t) => ({
    alignment: t.field({ type: ButtonAlignment, required: false }),
    color: t.string({ required: false })
  })
})

const ButtonBlockCreateInput = builder.inputType('ButtonBlockCreateInput', {
  fields: (t) => ({
    id: t.id({ required: false }),
    journeyId: t.id({ required: true }),
    parentBlockId: t.id({ required: true }),
    label: t.string({ required: true }),
    variant: t.field({ type: ButtonVariant, required: false }),
    color: t.field({ type: ButtonColor, required: false }),
    size: t.field({ type: ButtonSize, required: false }),
    submitEnabled: t.boolean({ required: false }),
    settings: t.field({ type: ButtonBlockSettingsInput, required: false })
  })
})

const ButtonBlockUpdateInput = builder.inputType('ButtonBlockUpdateInput', {
  fields: (t) => ({
    parentBlockId: t.id({ required: false }),
    label: t.string({ required: false }),
    variant: t.field({ type: ButtonVariant, required: false }),
    color: t.field({ type: ButtonColor, required: false }),
    size: t.field({ type: ButtonSize, required: false }),
    startIconId: t.id({ required: false }),
    endIconId: t.id({ required: false }),
    submitEnabled: t.boolean({ required: false }),
    settings: t.field({ type: ButtonBlockSettingsInput, required: false })
  })
})

const ButtonBlockSettings = builder.objectType(
  builder.objectRef<ButtonBlockSettingsType>('ButtonBlockSettings'),
  {
    fields: (t) => ({
      alignment: t.field({
        type: ButtonAlignment,
        nullable: true,
        directives: { shareable: true },
        resolve: (settings) => settings.alignment
      }),
      color: t.string({
        nullable: true,
        directives: { shareable: true },
        resolve: (settings) => settings.color
      })
    })
  }
)

export const ButtonBlock = builder.prismaObject('Block', {
  variant: 'ButtonBlock',
  interfaces: [Block],
  isTypeOf: (obj: any) => obj.typename === 'ButtonBlock',
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
    label: t.string({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.label ?? ''
    }),
    variant: t.field({
      type: ButtonVariant,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.variant as ButtonVariantType
    }),
    color: t.field({
      type: ButtonColor,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.color as ButtonColorType
    }),
    size: t.field({
      type: ButtonSize,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.size as ButtonSizeType
    }),
    startIconId: t.exposeID('startIconId', {
      nullable: true,
      directives: { shareable: true }
    }),
    endIconId: t.exposeID('endIconId', {
      nullable: true,
      directives: { shareable: true }
    }),
    submitEnabled: t.exposeBoolean('submitEnabled', {
      nullable: true,
      directives: { shareable: true }
    }),
    settings: t.field({
      type: ButtonBlockSettings,
      nullable: true,
      directives: { shareable: true },
      resolve: ({ settings }) => settings as unknown as ButtonBlockSettingsType
    }),
    action: t.field({
      type: ActionInterface,
      nullable: true,
      directives: { shareable: true },
      resolve: async (block) => {
        const action = await prisma.action.findUnique({
          where: { parentBlockId: block.id }
        })
        return action
      }
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
