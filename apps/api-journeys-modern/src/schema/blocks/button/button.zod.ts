import { z } from 'zod'

import { ActionSchema } from '../action/action.zod'
import { BlockSchema } from '../blocks.zod'

const ButtonVariantSchema = z.enum(['text', 'contained'])
const ButtonColorSchema = z.enum(['primary', 'secondary', 'error', 'inherit'])
const ButtonSizeSchema = z.enum(['small', 'medium', 'large'])

const ButtonBlockSchema = BlockSchema.extend({
  label: z.string(),
  variant: ButtonVariantSchema.nullable(),
  color: ButtonColorSchema.nullable(),
  size: ButtonSizeSchema.nullable(),
  startIconId: z.string().nullable(),
  endIconId: z.string().nullable(),
  action: ActionSchema.nullable()
})

export {
  ButtonBlockSchema,
  ButtonVariantSchema,
  ButtonColorSchema,
  ButtonSizeSchema
}
