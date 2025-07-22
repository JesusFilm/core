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

// Input types for RadioOptionBlock operations
const RadioOptionBlockCreateInput = builder.inputType(
  'RadioOptionBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      label: t.string({ required: true })
    })
  }
)

const RadioOptionBlockUpdateInput = builder.inputType(
  'RadioOptionBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      label: t.string({ required: false })
    })
  }
)

export const RadioOptionBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'RadioOptionBlock',
  isTypeOf: (obj: any) => obj.typename === 'RadioOptionBlock',
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
builder.mutationField('radioOptionBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: RadioOptionBlock,
    nullable: false,
    args: {
      input: t.arg({ type: RadioOptionBlockCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { id, journeyId, parentBlockId, label } = input

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
            typename: 'RadioOptionBlock',
            journeyId,
            parentBlockId,
            parentOrder,
            label
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

builder.mutationField('radioOptionBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: RadioOptionBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: RadioOptionBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      const { parentBlockId, label } = input

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

        if (label !== undefined) {
          updateData.label = label
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
