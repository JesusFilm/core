import { z } from 'zod'

export const actionBaseSchema = z.object({
  parentBlockId: z.string().describe('ID of the parent block'),
  gtmEventName: z.string().describe('GTM event name')
})

export const actionNavigateToBlockSchema = actionBaseSchema.extend({
  blockId: z.string().describe('ID of the block to navigate to')
})

export const actionLinkSchema = actionBaseSchema.extend({
  url: z.string().describe('URL to navigate to'),
  target: z.string().describe('Target of the link like _blank, _self, etc.')
})

export const actionEmailSchema = actionBaseSchema.extend({
  email: z.string().describe('Email to send to')
})

export const actionSchema = z.union([
  actionNavigateToBlockSchema,
  actionLinkSchema,
  actionEmailSchema
])

export const actionNavigateToBlockInputSchema = actionNavigateToBlockSchema
  .pick({
    gtmEventName: true,
    blockId: true
  })
  .partial()
  .required({
    blockId: true
  })

export const actionLinkInputSchema = actionLinkSchema
  .pick({
    gtmEventName: true,
    url: true,
    target: true
  })
  .partial()
  .required({
    url: true
  })

export const actionEmailInputSchema = actionEmailSchema
  .pick({
    gtmEventName: true,
    email: true
  })
  .partial()
  .required({
    email: true
  })
