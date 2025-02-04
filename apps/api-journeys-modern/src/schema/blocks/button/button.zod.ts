import { z } from 'zod'

import { ActionSchema } from '../action/action.zod'
import { BlockSchema } from '../blocks.zod'

const ButtonVariantSchema = z.enum(['text', 'contained'])
const ButtonColorSchema = z.enum(['primary', 'secondary', 'error', 'inherit'])
const ButtonSizeSchema = z.enum(['small', 'medium', 'large'])

const ButtonBlockSchema = BlockSchema.extend({
  label: z.string().describe('The label of the button'),
  variant: ButtonVariantSchema.nullable().describe('The variant of the button'),
  color: ButtonColorSchema.nullable().describe('The color of the button'),
  size: ButtonSizeSchema.nullable().describe('The size of the button'),
  startIconId: z.string().nullable().describe('The ID of the start icon'),
  endIconId: z.string().nullable().describe('The ID of the end icon'),
  action: ActionSchema.nullable().describe(
    'The action associated with the button'
  )
})

export {
  ButtonBlockSchema,
  ButtonVariantSchema,
  ButtonColorSchema,
  ButtonSizeSchema
}
