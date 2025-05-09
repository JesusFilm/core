import { z } from 'zod'

import { BlockFields_CardBlock } from '../../../../../../__generated__/BlockFields'
import {
  CardBlockCreateInput,
  CardBlockUpdateInput,
  ThemeMode,
  ThemeName
} from '../../../../../../__generated__/globalTypes'
import { actionSchema } from '../action/type'
import { blockSchema } from '../type'

export const themeModeEnum = z.nativeEnum(ThemeMode)
export const themeNameEnum = z.nativeEnum(ThemeName)

export const blockCardSchema = blockSchema.extend({
  label: z.string().describe('Label for the card'),
  __typename: z.literal('CardBlock'),
  backgroundColor: z.string().describe('Background color of the card (hex)'),
  coverBlockId: z.string().describe('ID of the cover block'),
  themeMode: themeModeEnum.nullable().describe('Theme mode of the card'),
  themeName: themeNameEnum.nullable().describe('Theme name of the card'),
  fullscreen: z.boolean().describe('Whether the card is fullscreen'),
  action: actionSchema
}) satisfies z.ZodType<BlockFields_CardBlock>

export const blockCardCreateInputSchema = blockCardSchema
  .pick({
    id: true,
    journeyId: true,
    parentBlockId: true,
    backgroundColor: true,
    fullscreen: true,
    themeMode: true,
    themeName: true
  })
  .merge(
    z.object({
      parentBlockId: z
        .string()
        .describe(
          'ID of the parent block. This should be the step block that the card is inside of.'
        )
    })
  ) satisfies z.ZodType<CardBlockCreateInput>

export const blockCardUpdateInputSchema = blockCardSchema
  .pick({
    backgroundColor: true,
    coverBlockId: true,
    themeMode: true,
    themeName: true,
    fullscreen: true
  })
  .merge(
    z.object({
      parentBlockId: z
        .string()
        .describe(
          'ID of the parent block. This should be the step block that the card is inside of.'
        )
    })
  ) satisfies z.ZodType<CardBlockUpdateInput>
