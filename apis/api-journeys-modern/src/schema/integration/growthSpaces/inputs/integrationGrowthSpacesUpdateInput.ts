import { builder } from '../../../builder'

export const IntegrationGrowthSpacesUpdateInput = builder.inputType(
  'IntegrationGrowthSpacesUpdateInput',
  {
    fields: (t) => ({
      accessId: t.string({ required: true }),
      accessSecret: t.string({ required: true })
    })
  }
)
