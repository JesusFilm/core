import { builder } from '../../builder'

export const UserMediaProfileCreateInput = builder.inputType(
  'UserMediaProfileCreateInput',
  {
    fields: (t) => ({
      languageInterestIds: t.field({ type: ['String'], required: false }),
      countryInterestIds: t.field({ type: ['String'], required: false }),
      userInterestIds: t.field({ type: ['String'], required: false })
    })
  }
)
