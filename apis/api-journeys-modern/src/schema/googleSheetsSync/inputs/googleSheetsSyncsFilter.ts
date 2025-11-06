import { builder } from '../../builder'

export const GoogleSheetsSyncsFilter = builder.inputType(
  'GoogleSheetsSyncsFilter',
  {
    fields: (t) => ({
      journeyId: t.id(),
      integrationId: t.id()
    })
  }
)

