import { builder } from '../builder'

export const GoogleSheetsSync = builder.prismaObject('GoogleSheetsSync', {
  fields: (t) => ({
    id: t.exposeID('id'),
    teamId: t.exposeString('teamId'),
    journeyId: t.exposeString('journeyId'),
    spreadsheetId: t.exposeString('spreadsheetId'),
    sheetName: t.exposeString('sheetName'),
    folderId: t.exposeString('folderId', { nullable: true }),
    appendMode: t.exposeBoolean('appendMode')
  })
})
