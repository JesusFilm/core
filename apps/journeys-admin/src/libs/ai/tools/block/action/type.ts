import { z } from 'zod'

import {
  ActionFields,
  ActionFields_EmailAction,
  ActionFields_LinkAction,
  ActionFields_NavigateToBlockAction
} from '../../../../../../__generated__/ActionFields'
import { BlockUpdateActionInput } from '../../../../../../__generated__/globalTypes'

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

export const blockActionUpdateInputSchema = z.object({
  gtmEventName: z
    .string()
    .nullable()
    .optional()
    .describe('Google Tag Manager event name for analytics.'),
  email: z
    .string()
    .nullable()
    .optional()
    .describe(
      'Email to send to. If this is provided, you must not provide the url, target and blockId fields'
    ),
  url: z
    .string()
    .nullable()
    .optional()
    .describe(
      'URL to navigate to. If this is provided, you must not provide the email, blockId. You must also provide a target.'
    ),
  target: z
    .string()
    .nullable()
    .optional()
    .describe(
      'Target of the link like _blank, _self, etc. If this is provided, you must not provide the email, blockId. You must also provide a url.'
    ),
  blockId: z
    .string()
    .nullable()
    .optional()
    .describe(
      'ID of the block to navigate to. If this is provided, you must not provide the email, url and target fields.'
    )
}) satisfies z.ZodType<BlockUpdateActionInput>
