import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import {
  ThemeMode as PrismaThemeMode,
  ThemeName as PrismaThemeName,
  prisma
} from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { builder } from '../../builder'
import { Block } from '../block'

import { ThemeMode } from './enums/themeMode'
import { ThemeName } from './enums/themeName'
import { CardBlockCreateInput, CardBlockUpdateInput } from './inputs'

export const CardBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'CardBlock',
  isTypeOf: (obj: any) => obj.typename === 'CardBlock',
  shareable: true,
  fields: (t) => ({
    backgroundColor: t.exposeString('backgroundColor', {
      nullable: true,
      description: `backgroundColor should be a HEX color value e.g #FFFFFF for white.`
    }),
    backdropBlur: t.exposeInt('backdropBlur', {
      nullable: true,
      description: `backdropBlur should be a number representing blur amount in pixels e.g 20.`
    }),
    coverBlockId: t.exposeID('coverBlockId', {
      nullable: true,
      description: `coverBlockId is present if a child block should be used as a cover.
This child block should not be rendered normally, instead it should be used
as a background. Blocks are often of type ImageBlock or VideoBlock.`
    }),
    fullscreen: t.boolean({
      nullable: false,
      description: `fullscreen should control how the coverBlock is displayed. When fullscreen
is set to true the coverBlock Image should be displayed as a blur in the
background.`,
      resolve: (block) => block.fullscreen ?? false
    }),
    themeMode: t.field({
      type: ThemeMode,
      nullable: true,
      description: `themeMode can override journey themeMode. If nothing is set then use
themeMode from journey`,
      resolve: (block) => block.themeMode as PrismaThemeMode | null
    }),
    themeName: t.field({
      type: ThemeName,
      nullable: true,
      description: `themeName can override journey themeName. If nothing is set then use
themeName from journey`,
      resolve: (block) => block.themeName as PrismaThemeName | null
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

// CardBlock Mutations
builder.mutationField('cardBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: CardBlock,
    nullable: false,
    args: {
      input: t.arg({ type: CardBlockCreateInput, required: true })
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
        throw new GraphQLError('user is not allowed to create card block', {
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
          typename: 'CardBlock',
          parentBlockId: input.parentBlockId,
          parentOrder,
          backgroundColor: input.backgroundColor,
          backdropBlur: input.backdropBlur,
          fullscreen: input.fullscreen ?? false,
          themeMode: input.themeMode,
          themeName: input.themeName
        }

        const cardBlock = await tx.block.create({
          data: blockData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: input.journeyId },
          data: { updatedAt: new Date() }
        })

        return cardBlock
      })
    }
  })
)

builder.mutationField('cardBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: CardBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CardBlockUpdateInput, required: true }),
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
        throw new GraphQLError('card block not found', {
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
        throw new GraphQLError('user is not allowed to update card block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (input.parentBlockId !== undefined)
          updateData.parentBlockId = input.parentBlockId
        if (input.coverBlockId !== undefined)
          updateData.coverBlockId = input.coverBlockId
        if (input.backgroundColor !== undefined)
          updateData.backgroundColor = input.backgroundColor
        if (input.backdropBlur !== undefined)
          updateData.backdropBlur = input.backdropBlur
        if (input.fullscreen !== undefined)
          updateData.fullscreen = input.fullscreen
        if (input.themeMode !== undefined)
          updateData.themeMode = input.themeMode
        if (input.themeName !== undefined)
          updateData.themeName = input.themeName

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
