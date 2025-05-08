import { z } from 'zod'

import {
  ActionFields,
  ActionFields_EmailAction,
  ActionFields_LinkAction,
  ActionFields_NavigateToBlockAction
} from '../../../../../__generated__/ActionFields'
import {
  EmailActionInput,
  LinkActionInput
} from '../../../../../__generated__/globalTypes'

export const actionBaseSchema = z.object({
  parentBlockId: z.string().describe('ID of the parent block'),
  gtmEventName: z.string().describe('GTM event name')
})

export const actionNavigateToBlockSchema = actionBaseSchema.extend({
  __typename: z.literal('NavigateToBlockAction'),
  blockId: z.string().describe('ID of the block to navigate to')
}) satisfies z.ZodType<ActionFields_NavigateToBlockAction>

export const actionLinkSchema = actionBaseSchema.extend({
  __typename: z.literal('LinkAction'),
  url: z.string().describe('URL to navigate to'),
  target: z.string().describe('Target of the link like _blank, _self, etc.')
}) satisfies z.ZodType<ActionFields_LinkAction>

export const actionEmailSchema = actionBaseSchema.extend({
  __typename: z.literal('EmailAction'),
  email: z.string().describe('Email to send to')
}) satisfies z.ZodType<ActionFields_EmailAction>

export const actionSchema = z.union([
  actionNavigateToBlockSchema,
  actionLinkSchema,
  actionEmailSchema
]) satisfies z.ZodType<ActionFields>

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
  }) satisfies z.ZodType<LinkActionInput>

export const actionEmailInputSchema = actionEmailSchema
  .pick({
    gtmEventName: true,
    email: true
  })
  .partial()
  .required({
    email: true
  }) satisfies z.ZodType<EmailActionInput>
