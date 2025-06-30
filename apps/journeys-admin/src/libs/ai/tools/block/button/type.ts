import { z } from 'zod'

import { BlockFields_ButtonBlock } from '../../../../../../__generated__/BlockFields'
import {
  ButtonBlockCreateInput,
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

export const blockButtonCreateInputSchema = blockButtonSchema
  .pick({
    journeyId: true,
    parentBlockId: true,
    label: true,
    size: true,
    submitEnabled: true
  })
  .extend({
    parentBlockId: z
      .string()
      .describe(
        'ID of the parent block. The parent block must be a card block!'
      ),
    variant: buttonVariantEnum
      .nullable()
      .optional()
      .describe('Variant of the button'),
    color: buttonColorEnum.nullable().optional().describe('Color of the button')
  }) satisfies z.ZodType<ButtonBlockCreateInput>

export const blockButtonUpdateInputSchema = blockButtonSchema
  .pick({
    size: true,
    startIconId: true,
    endIconId: true,
    submitEnabled: true
  })
  .merge(
    blockButtonSchema
      .pick({
        label: true,
        parentBlockId: true
      })
      .partial()
  )
  .extend({
    color: buttonColorEnum
      .nullable()
      .optional()
      .describe('Color of the button'),
    variant: buttonVariantEnum
      .nullable()
      .optional()
      .describe('Variant of the button')
  }) satisfies z.ZodType<ButtonBlockUpdateInput>
