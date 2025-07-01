import { z } from 'zod'

import { BlockFields_ButtonBlock } from '../../../../../../__generated__/BlockFields'
import {
  ButtonAlignment,
  ButtonBlockCreateInput,
  ButtonBlockSettingsInput,
  ButtonBlockUpdateInput,
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../__generated__/globalTypes'
import { actionSchema } from '../action/type'
import { blockSchema } from '../type'

export const buttonVariantEnum = z.nativeEnum(ButtonVariant)
export const buttonColorEnum = z.nativeEnum(ButtonColor)
export const buttonSizeEnum = z.nativeEnum(ButtonSize)
export const buttonAlignmentEnum = z.nativeEnum(ButtonAlignment)

export const buttonBlockSettingsInputSchema = z.object({
  alignment: buttonAlignmentEnum
    .nullable()
    .optional()
    .describe('Alignment of the button')
}) satisfies z.ZodType<ButtonBlockSettingsInput>

export const blockButtonSchema = blockSchema.extend({
  parentBlockId: z
    .string()
    .describe('ID of the parent block. The parent block must be a card block!'),
  label: z.string().describe('Label for the button'),
  buttonVariant: buttonVariantEnum.nullable().describe('Variant of the button'),
  buttonColor: buttonColorEnum.nullable().describe('Color of the button'),
  size: buttonSizeEnum.nullable().describe('Size of the button'),
  startIconId: z.string().describe('ID of the start icon'),
  endIconId: z.string().describe('ID of the end icon'),
  submitEnabled: z.boolean().describe('Whether the button is enabled'),
  __typename: z.literal('ButtonBlock'),
  action: actionSchema
}) satisfies z.ZodType<BlockFields_ButtonBlock>

export const blockButtonCreateInputSchema = z.object({
  id: z
    .string()
    .nullable()
    .optional()
    .describe('Unique identifier for the block'),
  journeyId: z.string().describe('ID of the journey this block belongs to'),
  parentBlockId: z
    .string()
    .describe('ID of the parent block. The parent block must be a card block!'),
  label: z.string().describe('Label for the button'),
  variant: buttonVariantEnum
    .nullable()
    .optional()
    .describe('Variant of the button'),
  color: buttonColorEnum.nullable().optional().describe('Color of the button'),
  size: buttonSizeEnum.nullable().optional().describe('Size of the button'),
  submitEnabled: z
    .boolean()
    .nullable()
    .optional()
    .describe('Whether the button is enabled'),
  settings: buttonBlockSettingsInputSchema
    .nullable()
    .optional()
    .describe('Settings for the button including alignment')
}) satisfies z.ZodType<ButtonBlockCreateInput>

export const blockButtonUpdateInputSchema = z.object({
  parentBlockId: z
    .string()
    .nullable()
    .optional()
    .describe('ID of the parent block. The parent block must be a card block!'),
  label: z.string().nullable().optional().describe('Label for the button'),
  variant: buttonVariantEnum
    .nullable()
    .optional()
    .describe('Variant of the button'),
  color: buttonColorEnum.nullable().optional().describe('Color of the button'),
  size: buttonSizeEnum.nullable().optional().describe('Size of the button'),
  startIconId: z
    .string()
    .nullable()
    .optional()
    .describe('ID of the start icon'),
  endIconId: z.string().nullable().optional().describe('ID of the end icon'),
  submitEnabled: z
    .boolean()
    .nullable()
    .optional()
    .describe('Whether the button is enabled'),
  settings: buttonBlockSettingsInputSchema
    .nullable()
    .optional()
    .describe('Settings for the button including alignment')
}) satisfies z.ZodType<ButtonBlockUpdateInput>
