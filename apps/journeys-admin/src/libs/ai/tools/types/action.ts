import { z } from 'zod'

// Action schema
export const baseActionSchema = z.object({
  parentBlockId: z.string().describe('ID of the parent block'),
  gtmEventName: z.string().describe('GTM event name')
})

// NavigateToBlockAction schema
export const navigateToBlockActionSchema = baseActionSchema.extend({
  blockId: z.string().describe('ID of the block to navigate to')
})

// LinkAction schema
export const linkActionSchema = baseActionSchema.extend({
  url: z.string().describe('URL to navigate to'),
  target: z.string().describe('Target of the link like _blank, _self, etc.')
})

// EmailAction schema
export const emailActionSchema = baseActionSchema.extend({
  email: z.string().describe('Email to send to')
})

export const actionSchema = z.union([
  navigateToBlockActionSchema,
  linkActionSchema,
  emailActionSchema
])

// NavigateToBlockActionInput schema
export const navigateToBlockActionInputSchema = navigateToBlockActionSchema
  .pick({
    gtmEventName: true,
    blockId: true
  })
  .partial()
  .required({
    blockId: true
  })

// LinkActionInput schema
export const linkActionInputSchema = linkActionSchema
  .pick({
    gtmEventName: true,
    url: true,
    target: true
  })
  .partial()
  .required({
    url: true
  })

// EmailActionInput schema
export const emailActionInputSchema = emailActionSchema
  .pick({
    gtmEventName: true,
    email: true
  })
  .partial()
  .required({
    email: true
  })
