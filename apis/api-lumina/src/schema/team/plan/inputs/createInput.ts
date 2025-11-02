import { z } from 'zod'

import { TWO_CHAR_COUNTRY_CODES } from '../../../../lib/twoCharCountryCodes'
import { builder } from '../../../builder'

const schema = z.object({
  teamId: z.string().uuid('Team ID must be a valid UUID'),
  billingEmail: z
    .string()
    .email()
    .max(512, 'Billing email must be less than 512 characters'),
  billingName: z.string().min(1, 'Billing name is required'),
  billingAddressCity: z.string().optional(),
  billingAddressCountry: z
    .enum(TWO_CHAR_COUNTRY_CODES, {
      invalid_type_error:
        'Billing address country must be a valid ISO 3166-1 alpha-2 code'
    })
    .optional(),
  billingAddressLine1: z.string().optional(),
  billingAddressLine2: z.string().optional(),
  billingAddressPostalCode: z.string().optional(),
  billingAddressState: z.string().optional()
})

export const TeamPlanCreateInput = builder.inputType(
  'LuminaTeamPlanCreateInput',
  {
    fields: (t) => ({
      teamId: t.id({ required: true }),
      billingEmail: t.string({ required: true }),
      billingName: t.string({ required: true }),
      billingAddressCity: t.string({ required: false }),
      billingAddressCountry: t.string({ required: false }),
      billingAddressLine1: t.string({ required: false }),
      billingAddressLine2: t.string({ required: false }),
      billingAddressPostalCode: t.string({ required: false }),
      billingAddressState: t.string({ required: false })
    }),
    validate: {
      schema
    }
  }
)
