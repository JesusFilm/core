import { GraphQLError } from 'graphql'
import slugify from 'slugify'
import { v4 as uuidv4 } from 'uuid'

import { JourneyStatus } from '.prisma/api-journeys-modern-client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { Block } from '../block'

// Input types for StepBlock operations
const StepBlockCreateInput = builder.inputType('StepBlockCreateInput', {
  fields: (t) => ({
    id: t.id({ required: false }),
    journeyId: t.id({ required: true }),
    nextBlockId: t.id({ required: false }),
    locked: t.boolean({ required: false }),
    x: t.int({
      required: false,
      description:
        'x is used to position the block horizontally in the journey flow diagram on the editor.'
    }),
    y: t.int({
      required: false,
      description:
        'y is used to position the block vertically in the journey flow diagram on the editor.'
    })
  })
})

const StepBlockUpdateInput = builder.inputType('StepBlockUpdateInput', {
  fields: (t) => ({
    nextBlockId: t.id({ required: false }),
    locked: t.boolean({ required: false }),
    x: t.int({
      required: false,
      description:
        'x is used to position the block horizontally in the journey flow diagram on the editor.'
    }),
    y: t.int({
      required: false,
      description:
        'y is used to position the block vertically in the journey flow diagram on the editor.'
    }),
    slug: t.string({
      required: false,
      description:
        'Slug should be unique amongst all blocks (server will throw BAD_USER_INPUT error if not). If not required will use the current block id. If the generated slug is not unique the uuid will be placed at the end of the slug guaranteeing uniqueness'
    })
  })
})

const StepBlockPositionUpdateInput = builder.inputType(
  'StepBlockPositionUpdateInput',
  {
    fields: (t) => ({
      id: t.id({ required: true }),
      x: t.int({ required: false }),
      y: t.int({ required: false })
    })
  }
)

export const StepBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'StepBlock',
  isTypeOf: (obj: any) => obj.typename === 'StepBlock',
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
    locked: t.boolean({
      nullable: false,
      directives: { shareable: true },
      description: `locked will be set to true if the user should not be able to manually
advance to the next step.`,
      resolve: (block) => block.locked ?? false
    }),
    nextBlockId: t.exposeID('nextBlockId', {
      nullable: true,
      directives: { shareable: true },
      description: `nextBlockId contains the preferred block to navigate to, users will have to
manually set the next block they want to card to navigate to`
    }),
    x: t.exposeInt('x', {
      nullable: true,
      directives: { shareable: true },
      description: `x is used to position the block horizontally in the journey flow diagram on
the editor.`
    }),
    y: t.exposeInt('y', {
      nullable: true,
      directives: { shareable: true },
      description: `y is used to position the block vertically in the journey flow diagram on
the editor.`
    }),
    slug: t.exposeString('slug', {
      nullable: true,
      directives: { shareable: true },
      description: `Slug should be unique amongst all blocks
(server will throw BAD_USER_INPUT error if not)
If not required will use the current block id
If the generated slug is not unique the uuid will be placed
at the end of the slug guaranteeing uniqueness`
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

// StepBlock Mutations
builder.mutationField('stepBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: StepBlock,
    nullable: false,
    args: {
      input: t.arg({ type: StepBlockCreateInput, required: true })
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
        throw new GraphQLError('user is not allowed to create step block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        // Get the current step blocks count for ordering
        const stepBlocks = await tx.block.findMany({
          where: {
            journeyId: input.journeyId,
            typename: 'StepBlock',
            deletedAt: null
          }
        })

        const blockData = {
          id: input.id ?? uuidv4(),
          journeyId: input.journeyId,
          typename: 'StepBlock',
          parentOrder: stepBlocks.length,
          nextBlockId: input.nextBlockId,
          locked: input.locked ?? false,
          x: input.x,
          y: input.y
        }

        const stepBlock = await tx.block.create({
          data: blockData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: input.journeyId },
          data: { updatedAt: new Date() }
        })

        return stepBlock
      })
    }
  })
)

builder.mutationField('stepBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: StepBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: StepBlockUpdateInput, required: true }),
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
        throw new GraphQLError('step block not found', {
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
        throw new GraphQLError('user is not allowed to update step block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (input.nextBlockId !== undefined)
          updateData.nextBlockId = input.nextBlockId
        if (input.locked !== undefined) updateData.locked = input.locked
        if (input.x !== undefined) updateData.x = input.x
        if (input.y !== undefined) updateData.y = input.y

        if (input.slug !== undefined) {
          updateData.slug = input.slug
            ? slugify(input.slug, {
                lower: true,
                strict: true
              })
            : blockWithJourney.id
        }

        try {
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
        } catch (err: any) {
          if (err.code === 'P2002' && err.meta?.target?.includes('slug')) {
            // Generate unique slug if conflict
            const uniqueSlug = `${updateData.slug}-${uuidv4().slice(0, 8)}`
            updateData.slug = uniqueSlug

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
          }
          throw err
        }
      })
    }
  })
)

builder.mutationField('stepBlockPositionUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [StepBlock],
    nullable: false,
    args: {
      input: t.arg({ type: [StepBlockPositionUpdateInput], required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args

      if (input.length === 0) {
        return []
      }

      // Get the first block to check journey permissions
      const firstBlockWithJourney = await fetchBlockWithJourneyAcl(input[0].id)
      if (!firstBlockWithJourney) {
        throw new GraphQLError('step block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check permissions using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', firstBlockWithJourney.journey),
          context.user
        )
      ) {
        throw new GraphQLError(
          'user is not allowed to update step block positions',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      return await prisma.$transaction(async (tx) => {
        const updatedBlocks = await Promise.all(
          input.map(async (blockInput) => {
            const updateData: any = {}
            if (blockInput.x !== undefined) updateData.x = blockInput.x
            if (blockInput.y !== undefined) updateData.y = blockInput.y

            return await tx.block.update({
              where: { id: blockInput.id },
              data: updateData
            })
          })
        )

        // Update journey timestamp
        await tx.journey.update({
          where: { id: firstBlockWithJourney.journeyId },
          data: { updatedAt: new Date() }
        })

        return updatedBlocks
      })
    }
  })
)
