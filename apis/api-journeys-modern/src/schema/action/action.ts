import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { Action as PrismaAction } from '.prisma/api-journeys-modern-client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { prisma } from '../../lib/prisma'
import { Block } from '../block/block'
import { builder } from '../builder'

// Create the Action interface reference
const ActionInterface = builder.interfaceRef<PrismaAction>('Action')

// Create concrete action references
const NavigateToBlockActionRef = builder.objectRef<PrismaAction>(
  'NavigateToBlockAction'
)
const LinkActionRef = builder.objectRef<PrismaAction>('LinkAction')
const EmailActionRef = builder.objectRef<PrismaAction>('EmailAction')

// Define the Action interface
ActionInterface.implement({
  fields: (t) => ({
    parentBlockId: t.exposeID('parentBlockId'),
    gtmEventName: t.exposeString('gtmEventName', { nullable: true }),
    parentBlock: t.field({
      type: Block,
      resolve: async (action) => {
        const block = await prisma.block.findUnique({
          where: { id: action.parentBlockId }
        })
        if (!block) {
          throw new GraphQLError('Parent block not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
        return block
      }
    })
  }),
  resolveType: (action) => {
    if (action.blockId != null) return 'NavigateToBlockAction'
    if (action.email != null) return 'EmailAction'
    return 'LinkAction'
  }
})

// NavigateToBlockAction implementation
NavigateToBlockActionRef.implement({
  interfaces: [ActionInterface],
  isTypeOf: (action: any) => action.blockId != null,
  fields: (t) => ({
    parentBlockId: t.exposeID('parentBlockId'),
    gtmEventName: t.exposeString('gtmEventName', { nullable: true }),
    blockId: t.string({
      nullable: false,
      resolve: (action) => action.blockId || ''
    }),
    parentBlock: t.field({
      type: Block,
      resolve: async (action) => {
        const block = await prisma.block.findUnique({
          where: { id: action.parentBlockId }
        })
        if (!block) {
          throw new GraphQLError('Parent block not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
        return block
      }
    })
  })
})

// LinkAction implementation
LinkActionRef.implement({
  interfaces: [ActionInterface],
  isTypeOf: (action: any) => action.url != null && action.email == null,
  fields: (t) => ({
    parentBlockId: t.exposeID('parentBlockId'),
    gtmEventName: t.exposeString('gtmEventName', { nullable: true }),
    url: t.string({
      nullable: false,
      resolve: (action) => action.url || ''
    }),
    target: t.exposeString('target', { nullable: true }),
    parentBlock: t.field({
      type: Block,
      resolve: async (action) => {
        const block = await prisma.block.findUnique({
          where: { id: action.parentBlockId }
        })
        if (!block) {
          throw new GraphQLError('Parent block not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
        return block
      }
    })
  })
})

// EmailAction implementation
EmailActionRef.implement({
  interfaces: [ActionInterface],
  isTypeOf: (action: any) => action.email != null,
  fields: (t) => ({
    parentBlockId: t.exposeID('parentBlockId'),
    gtmEventName: t.exposeString('gtmEventName', { nullable: true }),
    email: t.string({
      nullable: false,
      resolve: (action) => action.email || ''
    }),
    parentBlock: t.field({
      type: Block,
      resolve: async (action) => {
        const block = await prisma.block.findUnique({
          where: { id: action.parentBlockId }
        })
        if (!block) {
          throw new GraphQLError('Parent block not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
        return block
      }
    })
  })
})

// Input types for actions
const NavigateToBlockActionInput = builder.inputType(
  'NavigateToBlockActionInput',
  {
    fields: (t) => ({
      gtmEventName: t.string({ required: false }),
      blockId: t.string({ required: true })
    })
  }
)

const LinkActionInput = builder.inputType('LinkActionInput', {
  fields: (t) => ({
    gtmEventName: t.string({ required: false }),
    url: t.string({ required: true }),
    target: t.string({ required: false })
  })
})

const EmailActionInput = builder.inputType('EmailActionInput', {
  fields: (t) => ({
    gtmEventName: t.string({ required: false }),
    email: t.string({ required: true })
  })
})

const BlockUpdateActionInput = builder.inputType('BlockUpdateActionInput', {
  fields: (t) => ({
    gtmEventName: t.string({ required: false }),
    email: t.string({ required: false }),
    url: t.string({ required: false }),
    target: t.string({ required: false }),
    blockId: t.string({ required: false })
  })
})

// Helper function to check if a block can have actions
function canBlockHaveAction(block: any): boolean {
  return [
    'SignUpBlock',
    'RadioOptionBlock',
    'ButtonBlock',
    'VideoBlock',
    'VideoTriggerBlock'
  ].includes(block.typename)
}

// Helper function to validate and determine action type
function validateActionInput(input: any): {
  isValid: boolean
  actionType: string
  error?: string
} {
  const hasBlockId = !!input.blockId
  const hasUrl = !!input.url
  const hasEmail = !!input.email

  const count = [hasBlockId, hasUrl, hasEmail].filter(Boolean).length

  if (count === 0) {
    return {
      isValid: false,
      actionType: '',
      error: 'No valid action inputs provided'
    }
  }

  if (count > 1) {
    return {
      isValid: false,
      actionType: '',
      error: 'Invalid combination of action inputs provided'
    }
  }

  if (hasBlockId) return { isValid: true, actionType: 'NavigateToBlock' }
  if (hasEmail) return { isValid: true, actionType: 'Email' }
  if (hasUrl) return { isValid: true, actionType: 'Link' }

  return { isValid: false, actionType: '', error: 'Invalid action input' }
}

// Delete action mutation
builder.mutationField('blockDeleteAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: Block,
    args: {
      id: t.arg.id({ required: true }),
      journeyId: t.arg.id({ required: false })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args
      const user = context.user

      // Get the block with its journey for authorization
      const block = await prisma.block.findUnique({
        where: { id },
        include: {
          action: true,
          journey: {
            include: {
              userJourneys: true,
              team: { include: { userTeams: true } }
            }
          }
        }
      })

      if (!block) {
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization
      if (!ability(Action.Update, subject('Journey', block.journey), user)) {
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      if (!canBlockHaveAction(block)) {
        throw new GraphQLError('This block does not support actions', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      // Delete the action if it exists
      if (block.action) {
        await prisma.action.delete({ where: { parentBlockId: id } })
      }

      return block
    }
  })
)

// Update action mutation
builder.mutationField('blockUpdateAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: ActionInterface,
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: BlockUpdateActionInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      const user = context.user

      // Validate input
      const validation = validateActionInput(input)
      if (!validation.isValid) {
        throw new GraphQLError(validation.error!, {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      // Get the block with its journey for authorization
      const block = await prisma.block.findUnique({
        where: { id },
        include: {
          action: true,
          journey: {
            include: {
              userJourneys: true,
              team: { include: { userTeams: true } }
            }
          }
        }
      })

      if (!block) {
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization
      if (!ability(Action.Update, subject('Journey', block.journey), user)) {
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      if (!canBlockHaveAction(block)) {
        throw new GraphQLError('This block does not support actions', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      // Prepare the action data based on type
      const actionData: any = {
        gtmEventName: input.gtmEventName || null,
        // Reset all polymorphic fields first
        url: null,
        target: null,
        email: null,
        blockId: null,
        journeyId: null
      }

      if (validation.actionType === 'Link') {
        actionData.url = input.url
        actionData.target = input.target || null
      } else if (validation.actionType === 'Email') {
        actionData.email = input.email
      } else if (validation.actionType === 'NavigateToBlock') {
        actionData.blockId = input.blockId
        actionData.journeyId = block.journeyId
      }

      // Upsert the action
      const action = await prisma.action.upsert({
        where: { parentBlockId: id },
        create: {
          parentBlockId: id,
          ...actionData
        },
        update: actionData
      })

      return action
    }
  })
)

// Specific action update mutations
builder.mutationField('blockUpdateNavigateToBlockAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: NavigateToBlockActionRef,
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: NavigateToBlockActionInput, required: true }),
      journeyId: t.arg.id({ required: false })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      const user = context.user

      // Get the block with its journey for authorization
      const block = await prisma.block.findUnique({
        where: { id },
        include: {
          action: true,
          journey: {
            include: {
              userJourneys: true,
              team: { include: { userTeams: true } }
            }
          }
        }
      })

      if (!block) {
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization
      if (!ability(Action.Update, subject('Journey', block.journey), user)) {
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      if (!canBlockHaveAction(block)) {
        throw new GraphQLError(
          'This block does not support navigate to block actions',
          {
            extensions: { code: 'BAD_USER_INPUT' }
          }
        )
      }

      // Create or update the action
      const action = await prisma.action.upsert({
        where: { parentBlockId: id },
        create: {
          parentBlockId: id,
          gtmEventName: input.gtmEventName || null,
          blockId: input.blockId,
          journeyId: block.journeyId,
          // Reset other polymorphic fields
          url: null,
          target: null,
          email: null
        },
        update: {
          gtmEventName: input.gtmEventName || null,
          blockId: input.blockId,
          journeyId: block.journeyId,
          // Reset other polymorphic fields
          url: null,
          target: null,
          email: null
        }
      })

      return action
    }
  })
)

builder.mutationField('blockUpdateLinkAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: LinkActionRef,
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: LinkActionInput, required: true }),
      journeyId: t.arg.id({ required: false })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      const user = context.user

      // Get the block with its journey for authorization
      const block = await prisma.block.findUnique({
        where: { id },
        include: {
          action: true,
          journey: {
            include: {
              userJourneys: true,
              team: { include: { userTeams: true } }
            }
          }
        }
      })

      if (!block) {
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization
      if (!ability(Action.Update, subject('Journey', block.journey), user)) {
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      if (!canBlockHaveAction(block)) {
        throw new GraphQLError('This block does not support link actions', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      // Create or update the action
      const action = await prisma.action.upsert({
        where: { parentBlockId: id },
        create: {
          parentBlockId: id,
          gtmEventName: input.gtmEventName || null,
          url: input.url,
          target: input.target || null,
          // Reset other polymorphic fields
          blockId: null,
          journeyId: null,
          email: null
        },
        update: {
          gtmEventName: input.gtmEventName || null,
          url: input.url,
          target: input.target || null,
          // Reset other polymorphic fields
          blockId: null,
          journeyId: null,
          email: null
        }
      })

      return action
    }
  })
)

builder.mutationField('blockUpdateEmailAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: EmailActionRef,
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: EmailActionInput, required: true }),
      journeyId: t.arg.id({ required: false })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      const user = context.user

      // Get the block with its journey for authorization
      const block = await prisma.block.findUnique({
        where: { id },
        include: {
          action: true,
          journey: {
            include: {
              userJourneys: true,
              team: { include: { userTeams: true } }
            }
          }
        }
      })

      if (!block) {
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization
      if (!ability(Action.Update, subject('Journey', block.journey), user)) {
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      if (!canBlockHaveAction(block)) {
        throw new GraphQLError('This block does not support email actions', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      // Create or update the action
      const action = await prisma.action.upsert({
        where: { parentBlockId: id },
        create: {
          parentBlockId: id,
          gtmEventName: input.gtmEventName || null,
          email: input.email,
          // Reset other polymorphic fields
          blockId: null,
          journeyId: null,
          url: null,
          target: null
        },
        update: {
          gtmEventName: input.gtmEventName || null,
          email: input.email,
          // Reset other polymorphic fields
          blockId: null,
          journeyId: null,
          url: null,
          target: null
        }
      })

      return action
    }
  })
)

// Export the action types for use in other files
export {
  ActionInterface,
  NavigateToBlockActionRef,
  LinkActionRef,
  EmailActionRef
}
