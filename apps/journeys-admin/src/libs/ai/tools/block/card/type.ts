import { z } from 'zod'

import { BlockFields_CardBlock } from '../../../../../../__generated__/BlockFields'
import {
  CardBlockClassNamesInput,
  CardBlockCreateInput,
  CardBlockUpdateInput,
  ThemeMode,
  ThemeName
} from '../../../../../../__generated__/globalTypes'
import { actionSchema } from '../action/type'
import { blockSchema } from '../type'

export const themeModeEnum = z.nativeEnum(ThemeMode)
export const themeNameEnum = z.nativeEnum(ThemeName)

export const cardBlockClassNamesInputSchema = z.object({
  self: z.string().describe('Tailwind CSS class names for the card element')
}) satisfies z.ZodType<CardBlockClassNamesInput>

export const blockCardSchema = blockSchema.extend({
  label: z.string().describe('Label for the card'),
  __typename: z.literal('CardBlock'),
  backgroundColor: z.string().describe('Background color of the card (hex)'),
  backdropBlur: z.number().describe('Backdrop blur value for the card'),
  coverBlockId: z.string().describe('ID of the cover block'),
  themeMode: themeModeEnum
    .nullable()
    .describe(
      'Theme mode of the card. Use dark as the default value if no other theme mode is specified.'
    ),
  themeName: themeNameEnum
    .nullable()
    .describe(
      'Theme name of the card. Use base as the default value if no other theme name is specified.'
    ),
  fullscreen: z.boolean().describe('Whether the card is fullscreen'),
  action: actionSchema
}) satisfies z.ZodType<BlockFields_CardBlock>

export const blockCardCreateInputSchema = z.object({
  id: z
    .string()
    .nullable()
    .optional()
    .describe('Unique identifier for the block'),
  journeyId: z.string().describe('ID of the journey this block belongs to'),
  parentBlockId: z
    .string()
    .describe(
      'ID of the parent block. This should be the step block that the card is inside of.'
    ),
  backgroundColor: z
    .string()
    .nullable()
    .optional()
    .describe(
      'Background color of the card (hex). Use #30313D as the default value if no other color is specified.'
    ),
  backdropBlur: z
    .number()
    .nullable()
    .optional()
    .describe('Backdrop blur value for the card'),
  fullscreen: z
    .boolean()
    .nullable()
    .optional()
    .describe('Whether the card is fullscreen'),
  themeMode: themeModeEnum
    .nullable()
    .optional()
    .describe(
      'Theme mode of the card. Use dark as the default value if no other theme mode is specified.'
    ),
  themeName: themeNameEnum
    .nullable()
    .optional()
    .describe(
      'Theme name of the card. Use base as the default value if no other theme name is specified.'
    ),
  classNames: cardBlockClassNamesInputSchema
    .nullable()
    .optional()
    .describe('Tailwind CSS class names for styling the card element')
}) satisfies z.ZodType<CardBlockCreateInput>

export const blockCardUpdateInputSchema = z.object({
  parentBlockId: z
    .string()
    .nullable()
    .optional()
    .describe(
      'ID of the parent block. This should be the step block that the card is inside of.'
    ),
  coverBlockId: z
    .string()
    .nullable()
    .optional()
    .describe('ID of the cover block'),
  backgroundColor: z
    .string()
    .nullable()
    .optional()
    .describe('Background color of the card (hex)'),
  backdropBlur: z
    .number()
    .nullable()
    .optional()
    .describe('Backdrop blur value for the card'),
  fullscreen: z
    .boolean()
    .nullable()
    .optional()
    .describe('Whether the card is fullscreen'),
  themeMode: themeModeEnum
    .nullable()
    .optional()
    .describe('Theme mode of the card'),
  themeName: themeNameEnum
    .nullable()
    .optional()
    .describe('Theme name of the card'),
  classNames: cardBlockClassNamesInputSchema
    .nullable()
    .optional()
    .describe('Tailwind CSS class names for styling the card element')
}) satisfies z.ZodType<CardBlockUpdateInput>
