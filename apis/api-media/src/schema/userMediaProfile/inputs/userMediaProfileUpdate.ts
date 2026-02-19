import { builder } from '../../builder'

export const UserMediaProfileUpdateInput = builder.inputType(
  'UserMediaProfileUpdateInput',
  {
    fields: (t) => ({
      languageInterestIds: t.field({ type: ['ID'], required: false }),
      countryInterestIds: t.field({ type: ['ID'], required: false }),
      userInterestIds: t.field({ type: ['ID'], required: false })
    })
  }
)
