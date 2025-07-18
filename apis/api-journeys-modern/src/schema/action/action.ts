import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { Action as PrismaAction } from '.prisma/api-journeys-modern-client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../lib/auth/ability'
import { prisma } from '../../lib/prisma'
import { Block } from '../block/block'
import { builder } from '../builder'

// Define the Action interface
export const ActionInterface = builder.prismaInterface('Action', {
  name: 'Action',
  fields: (t) => ({
    parentBlockId: t.exposeID('parentBlockId'),
    gtmEventName: t.exposeString('gtmEventName', { nullable: true })
  }),
  resolveType: (obj) => {
    if (obj.blockId != null) return 'NavigateToBlockAction'
    if (obj.email != null) return 'EmailAction'
    return 'LinkAction'
  }
})

// NavigateToBlockAction type
export const NavigateToBlockAction = builder.prismaObject('Action', {
  interfaces: [ActionInterface],
  variant: 'NavigateToBlockAction',
  isTypeOf: (obj: any) => obj.blockId != null,
  fields: (t) => ({
    parentBlockId: t.exposeID('parentBlockId'),
    gtmEventName: t.exposeString('gtmEventName', { nullable: true }),
    blockId: t.exposeString('blockId')
  })
})

// LinkAction type
export const LinkAction = builder.prismaObject('Action', {
  interfaces: [ActionInterface],
  variant: 'LinkAction',
  isTypeOf: (obj: any) => obj.url != null && obj.blockId == null,
  fields: (t) => ({
    parentBlockId: t.exposeID('parentBlockId'),
    gtmEventName: t.exposeString('gtmEventName', { nullable: true }),
    url: t.exposeString('url'),
    target: t.exposeString('target', { nullable: true })
  })
})

// EmailAction type
export const EmailAction = builder.prismaObject('Action', {
  interfaces: [ActionInterface],
  variant: 'EmailAction',
  isTypeOf: (obj: any) => obj.email != null,
  fields: (t) => ({
    parentBlockId: t.exposeID('parentBlockId'),
    gtmEventName: t.exposeString('gtmEventName', { nullable: true }),
    email: t.exposeString('email')
  })
})

// Input types
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

// Utility function to check if block can have actions
export function canBlockHaveAction(block: { typename: string }): boolean {
  const supportedTypes = [
    'SignUpBlock',
    'RadioOptionBlock',
    'ButtonBlock',
    'VideoBlock',
    'VideoTriggerBlock'
  ]
  return supportedTypes.includes(block.typename)
}

// Validation schemas
export const linkActionInputSchema = z.object({
  gtmEventName: z.string().nullable(),
  url: z.string(),
  target: z.string().nullable()
})

export const emailActionInputSchema = z.object({
  gtmEventName: z.string().nullable(),
  email: z.string().email()
})

export const navigateToBlockActionInputSchema = z.object({
  gtmEventName: z.string().nullable(),
  blockId: z.string()
})

// Helper function to reset action fields when updating
const ACTION_UPDATE_RESET = {
  url: null,
  target: null,
  email: null,
  blockId: null
}

// Action service functions
export async function emailActionUpdate(
  id: string,
  input: { gtmEventName?: string | null; email: string }
): Promise<PrismaAction> {
  // Validate email
  try {
    emailActionInputSchema.parse(input)
  } catch {
    throw new GraphQLError('must be a valid email', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  }

  return await prisma.action.upsert({
    where: { parentBlockId: id },
    create: {
      ...input,
      parentBlockId: id
    },
    update: {
      ...ACTION_UPDATE_RESET,
      ...input
    }
  })
}

export async function linkActionUpdate(
  id: string,
  input: { gtmEventName?: string | null; url: string; target?: string | null }
): Promise<PrismaAction> {
  return await prisma.action.upsert({
    where: { parentBlockId: id },
    create: {
      ...input,
      parentBlockId: id
    },
    update: {
      ...ACTION_UPDATE_RESET,
      ...input
    }
  })
}

export async function navigateToBlockActionUpdate(
  id: string,
  input: { gtmEventName?: string | null; blockId: string }
): Promise<PrismaAction> {
  return await prisma.action.upsert({
    where: { parentBlockId: id },
    create: {
      ...input,
      parentBlockId: id
    },
    update: {
      ...ACTION_UPDATE_RESET,
      ...input
    }
  })
}

// Mutation resolvers
builder.mutationField('blockDeleteAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: Block,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      journeyId: t.arg({ type: 'ID', required: false }) // Optional for team merging
    },
    resolve: async (_parent, args, context) => {
      const { id } = args

      // Fetch block with ACL info
      const block = await prisma.block.findUnique({
        where: { id },
        include: {
          action: true,
          journey: {
            include: {
              team: {
                include: {
                  userTeams: true
                }
              },
              userJourneys: true
            }
          }
        }
      })

      if (!block) {
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', block.journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Check if block supports actions
      if (!canBlockHaveAction(block)) {
        throw new GraphQLError('This block does not support actions', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      // Delete the action
      await prisma.action.delete({ where: { parentBlockId: id } })

      return block
    }
  })
)

builder.mutationField('blockUpdateAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: ActionInterface,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: BlockUpdateActionInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args

      // Validate input combinations
      const { success: isLink, data: linkInput } =
        linkActionInputSchema.safeParse(input)
      const { success: isEmail, data: emailInput } =
        emailActionInputSchema.safeParse(input)
      const { success: isNavigateToBlock, data: navigateToBlockInput } =
        navigateToBlockActionInputSchema.safeParse(input)

      const numberOfValidInputs = [isLink, isEmail, isNavigateToBlock].filter(
        Boolean
      ).length

      if (numberOfValidInputs > 1) {
        throw new GraphQLError('invalid combination of inputs provided', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }
      if (numberOfValidInputs === 0) {
        throw new GraphQLError('no valid inputs provided', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      // Fetch block with ACL info
      const block = await prisma.block.findUnique({
        where: { id },
        include: {
          action: true,
          journey: {
            include: {
              team: {
                include: {
                  userTeams: true
                }
              },
              userJourneys: true
            }
          }
        }
      })

      if (!block) {
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', block.journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Check if block supports actions
      if (!canBlockHaveAction(block)) {
        throw new GraphQLError('This block does not support actions', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      // Perform the appropriate update
      if (isEmail) {
        return await emailActionUpdate(id, emailInput)
      }

      if (isNavigateToBlock) {
        return await navigateToBlockActionUpdate(id, navigateToBlockInput)
      }

      if (isLink) {
        return await linkActionUpdate(id, linkInput)
      }

      throw new GraphQLError('no valid inputs provided', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }
  })
)

builder.mutationField('blockUpdateNavigateToBlockAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: NavigateToBlockAction,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: NavigateToBlockActionInput, required: true }),
      journeyId: t.arg({ type: 'ID', required: false }) // Optional for team merging
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args

      // Fetch block with ACL info
      const block = await prisma.block.findUnique({
        where: { id },
        include: {
          action: true,
          journey: {
            include: {
              team: {
                include: {
                  userTeams: true
                }
              },
              userJourneys: true
            }
          }
        }
      })

      if (!block) {
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', block.journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Check if block supports actions
      if (!canBlockHaveAction(block)) {
        throw new GraphQLError(
          'This block does not support navigate to block actions',
          { extensions: { code: 'BAD_USER_INPUT' } }
        )
      }

      return await navigateToBlockActionUpdate(id, input)
    }
  })
)

builder.mutationField('blockUpdateLinkAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: LinkAction,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: LinkActionInput, required: true }),
      journeyId: t.arg({ type: 'ID', required: false }) // Optional for team merging
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args

      // Fetch block with ACL info
      const block = await prisma.block.findUnique({
        where: { id },
        include: {
          action: true,
          journey: {
            include: {
              team: {
                include: {
                  userTeams: true
                }
              },
              userJourneys: true
            }
          }
        }
      })

      if (!block) {
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', block.journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Check if block supports actions
      if (!canBlockHaveAction(block)) {
        throw new GraphQLError('This block does not support link actions', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      return await linkActionUpdate(id, input)
    }
  })
)

builder.mutationField('blockUpdateEmailAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: EmailAction,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: EmailActionInput, required: true }),
      journeyId: t.arg({ type: 'ID', required: false }) // Optional for team merging
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args

      // Fetch block with ACL info
      const block = await prisma.block.findUnique({
        where: { id },
        include: {
          action: true,
          journey: {
            include: {
              team: {
                include: {
                  userTeams: true
                }
              },
              userJourneys: true
            }
          }
        }
      })

      if (!block) {
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', block.journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Check if block supports actions
      if (!canBlockHaveAction(block)) {
        throw new GraphQLError('This block does not support email actions', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      return await emailActionUpdate(id, input)
    }
  })
)
