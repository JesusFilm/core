import { builder } from '../../../builder'

export const IntegrationGrowthSpacesCreateInput = builder.inputType(
  'IntegrationGrowthSpacesCreateInput',
  {
    fields: (t) => ({
      accessId: t.string({ required: true }),
      accessSecret: t.string({ required: true }),
      teamId: t.string({ required: true })
    })
  }
)
