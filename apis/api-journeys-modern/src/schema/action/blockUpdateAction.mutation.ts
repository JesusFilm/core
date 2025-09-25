import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'
import { z } from 'zod'

import { Block, MessagePlatform, Prisma, prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { INCLUDE_JOURNEY_ACL } from '../journey/journey.acl'

import { ActionInterface } from './action'
import { canBlockHaveAction } from './canBlockHaveAction'
import { BlockUpdateActionInput } from './inputs'

const emailSchema = z.object({
  email: z.string().email()
})

const linkActionInputSchema = z.object({
  gtmEventName: z.string().nullish(),
  url: z.string(),
  target: z.string().nullish()
})

const emailActionInputSchema = z.object({
  gtmEventName: z.string().nullish(),
  email: z.string().email()
})

const navigateToBlockActionInputSchema = z.object({
  gtmEventName: z.string().nullish(),
  blockId: z.string()
})

const phoneActionInputSchema = z.object({
  gtmEventName: z.string().nullish(),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/),
  countryCode: z.string()
})

const chatActionInputSchema = z.object({
  gtmEventName: z.string().nullish(),
  url: z.string(),
  target: z.string().nullish(),
  chatPlatform: z.nativeEnum(MessagePlatform).nullish()
})

const ACTION_UPDATE_RESET: Prisma.ActionUpdateInput = {
  url: null,
  target: null,
  email: null,
  phone: null,
  journey: { disconnect: true },
  block: { disconnect: true }
}

async function findParentStepBlock(id?: string): Promise<Block | undefined> {
  const block = await prisma.block.findUnique({ where: { id } })
  if (block?.parentBlockId == null) {
    if (block?.typename === 'StepBlock') return block
    return
  }
  return await findParentStepBlock(block.parentBlockId)
}

builder.mutationField('blockUpdateAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: ActionInterface,
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: BlockUpdateActionInput, required: true })
    },
    nullable: false,
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      const user = context.user

      const { success: isLink, data: linkInput } =
        linkActionInputSchema.safeParse(input)
      const { success: isEmail, data: emailInput } =
        emailActionInputSchema.safeParse(input)
      const { success: isNavigateToBlock, data: navigateToBlockInput } =
        navigateToBlockActionInputSchema.safeParse(input)
      const { success: isPhone, data: phoneInput } =
        phoneActionInputSchema.safeParse(input)
      const { success: isChat, data: chatInput } =
        chatActionInputSchema.safeParse(input)

      const numberOfValidInputs = [
        isLink,
        isEmail,
        isNavigateToBlock,
        isPhone,
        isChat
      ].filter(Boolean).length

      if (numberOfValidInputs > 1)
        throw new GraphQLError('invalid combination of inputs provided', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      if (numberOfValidInputs === 0)
        throw new GraphQLError('no valid inputs provided', {
          extensions: { code: 'BAD_USER_INPUT' }
        })

      // Get the block with its journey for authorization
      const block = await prisma.block.findUnique({
        where: { id },
        include: {
          action: true,
          ...INCLUDE_JOURNEY_ACL
        }
      })

      if (block == null)
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (
        !ability(Action.Update, subject('Journey', block.journey as any), user)
      ) {
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }
      if (block == null || !canBlockHaveAction(block)) {
        throw new GraphQLError('This block does not support actions', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      if (isEmail) {
        try {
          await emailSchema.parse({ email: input.email })
        } catch {
          throw new GraphQLError('must be a valid email', {
            extensions: { code: 'BAD_USER_INPUT' }
          })
        }

        return await prisma.action.upsert({
          where: { parentBlockId: id },
          create: {
            ...emailInput,
            parentBlock: { connect: { id: block.id } }
          },
          update: {
            ...ACTION_UPDATE_RESET,
            ...emailInput
          }
        })
      }

      if (isNavigateToBlock) {
        // Ensure required blockId for navigate type
        if (input.blockId == null) {
          throw new GraphQLError('no valid inputs provided', {
            extensions: { code: 'BAD_USER_INPUT' }
          })
        }
        const stepBlock = await findParentStepBlock(
          block.parentBlockId as string
        )
        if (stepBlock != null && stepBlock.id === input.blockId)
          throw new GraphQLError('blockId cannot be the parent step block id', {
            extensions: { code: 'BAD_USER_INPUT' }
          })

        const inputWithBlockConnection = {
          ...omit(navigateToBlockInput, 'blockId'),
          block: { connect: { id: input.blockId } }
        }
        return await prisma.action.upsert({
          where: { parentBlockId: id },
          create: {
            ...inputWithBlockConnection,
            parentBlock: { connect: { id: block.id } }
          },
          update: {
            ...ACTION_UPDATE_RESET,
            ...inputWithBlockConnection
          }
        })
      }

      if (isLink)
        return await prisma.action.upsert({
          where: { parentBlockId: id },
          create: {
            ...linkInput,
            parentBlock: { connect: { id: block.id } }
          },
          update: {
            ...ACTION_UPDATE_RESET,
            ...linkInput
          }
        })

      if (isPhone) {
        return await prisma.action.upsert({
          where: { parentBlockId: id },
          create: {
            ...phoneInput,
            parentBlock: { connect: { id: block.id } }
          },
          update: {
            ...ACTION_UPDATE_RESET,
            ...phoneInput
          }
        })
      }

      if (isChat) {
        return await prisma.action.upsert({
          where: { parentBlockId: id },
          create: {
            ...chatInput,
            parentBlock: { connect: { id: block.id } }
          },
          update: {
            ...ACTION_UPDATE_RESET,
            ...chatInput
          }
        })
      }

      throw new GraphQLError('no inputs provided', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }
  })
)
