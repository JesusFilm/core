import { builder } from '../../builder'

export const CreateGoogleSheetsSyncInput = builder.inputType(
  'CreateGoogleSheetsSyncInput',
  {
    fields: (t) => ({
      journeyId: t.string({ required: true }),
      integrationId: t.string({ required: true }),
      spreadsheetId: t.string({ required: true }),
      sheetName: t.string({ required: true }),
      folderId: t.string(),
      appendMode: t.boolean()
    })
  }
)
