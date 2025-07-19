import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { TextResponseType as PrismaTextResponseType } from '.prisma/api-journeys-modern-client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { Block } from '../block'

import { TextResponseType } from './enums/textResponseType'

// Input types for TextResponseBlock operations
const TextResponseBlockCreateInput = builder.inputType(
  'TextResponseBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      label: t.string({ required: true })
    })
  }
)

const TextResponseBlockUpdateInput = builder.inputType(
  'TextResponseBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      label: t.string({ required: false }),
      placeholder: t.string({ required: false }),
      required: t.boolean({ required: false }),
      hint: t.string({ required: false }),
      minRows: t.int({ required: false }),
      routeId: t.string({ required: false }),
      type: t.field({ type: TextResponseType, required: false }),
      integrationId: t.string({ required: false })
    })
  }
)

export const TextResponseBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'TextResponseBlock',
  isTypeOf: (obj: any) => obj.typename === 'TextResponseBlock',
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
    placeholder: t.exposeString('placeholder', {
      nullable: true,
      directives: { shareable: true }
    }),
    required: t.exposeBoolean('required', {
      nullable: true,
      directives: { shareable: true }
    }),
    hint: t.exposeString('hint', {
      nullable: true,
      directives: { shareable: true }
    }),
    minRows: t.exposeInt('minRows', {
      nullable: true,
      directives: { shareable: true }
    }),
    type: t.field({
      type: TextResponseType,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.type
    }),
    routeId: t.exposeString('routeId', {
      nullable: true,
      directives: { shareable: true }
    }),
    integrationId: t.exposeString('integrationId', {
      nullable: true,
      directives: { shareable: true }
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

// TextResponseBlock Mutations
builder.mutationField('textResponseBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: TextResponseBlock,
    nullable: false,
    args: {
      input: t.arg({ type: TextResponseBlockCreateInput, required: true })
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
          'user is not allowed to create text response block',
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
          typename: 'TextResponseBlock',
          parentBlockId: input.parentBlockId,
          parentOrder,
          label: input.label
        }

        const textResponseBlock = await tx.block.create({
          data: blockData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: input.journeyId },
          data: { updatedAt: new Date() }
        })

        return textResponseBlock
      })
    }
  })
)

builder.mutationField('textResponseBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: TextResponseBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: TextResponseBlockUpdateInput, required: true }),
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
        throw new GraphQLError('text response block not found', {
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
          'user is not allowed to update text response block',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (input.parentBlockId !== undefined)
          updateData.parentBlockId = input.parentBlockId
        if (input.label !== undefined) updateData.label = input.label
        if (input.placeholder !== undefined)
          updateData.placeholder = input.placeholder
        if (input.required !== undefined) updateData.required = input.required
        if (input.hint !== undefined) updateData.hint = input.hint
        if (input.minRows !== undefined) updateData.minRows = input.minRows
        if (input.routeId !== undefined) updateData.routeId = input.routeId
        if (input.type !== undefined) updateData.type = input.type
        if (input.integrationId !== undefined)
          updateData.integrationId = input.integrationId

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
