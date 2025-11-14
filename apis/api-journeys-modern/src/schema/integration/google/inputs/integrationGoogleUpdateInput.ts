import { builder } from '../../../builder'

export const IntegrationGoogleUpdateInput = builder.inputType(
  'IntegrationGoogleUpdateInput',
  {
    fields: (t) => ({
      code: t.string({ required: true }),
      redirectUri: t.string({ required: true })
    })
  }
)
