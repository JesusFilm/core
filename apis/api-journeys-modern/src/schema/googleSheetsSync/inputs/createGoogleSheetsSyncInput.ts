import { builder } from '../../builder'

export const CreateGoogleSheetsSyncInput = builder.inputType(
  'CreateGoogleSheetsSyncInput',
  {
    fields: (t) => ({
      journeyId: t.id({ required: true }),
      integrationId: t.id({ required: true }),
      spreadsheetId: t.id({ required: true }),
      sheetName: t.string({ required: true }),
      folderId: t.string()
    })
  }
)
