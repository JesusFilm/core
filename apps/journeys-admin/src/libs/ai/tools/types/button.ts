import { z } from 'zod'

import { blockSchema } from './block'

export const buttonVariantEnum = z.enum(['contained', 'outlined', 'text'])
export const buttonColorEnum = z.enum(['primary', 'secondary', 'error'])
export const buttonSizeEnum = z.enum(['small', 'medium', 'large'])

export const buttonSchema = blockSchema.extend({
  label: z.string().describe('Label for the button'),
  variant: buttonVariantEnum,
  color: buttonColorEnum,
  size: buttonSizeEnum,
  startIconId: z.string().describe('ID of the start icon'),
  endIconId: z.string().describe('ID of the end icon'),
  submitEnabled: z.boolean().describe('Whether the button is enabled')
})

export const buttonBlockCreateInputSchema = buttonSchema.pick({
  journeyId: true,
  parentBlockId: true,
  label: true,
  variant: true,
  color: true,
  size: true,
  submitEnabled: true
})

export const buttonBlockUpdateInputSchema = buttonSchema
  .pick({
    variant: true,
    color: true,
    size: true,
    startIconId: true,
    endIconId: true,
    submitEnabled: true
  })
  .merge(
    buttonSchema
      .pick({
        label: true,
        parentBlockId: true
      })
      .partial()
  )
