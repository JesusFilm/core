import { builder } from '../builder'
import { IntegrationRef } from '../integration/integration'
import { JourneyRef } from '../journey/journey'

export const GoogleSheetsSync = builder.prismaObject('GoogleSheetsSync', {
  fields: (t) => ({
    id: t.exposeID('id'),
    teamId: t.exposeString('teamId'),
    journeyId: t.exposeString('journeyId'),
    integrationId: t.exposeString('integrationId'),
    spreadsheetId: t.exposeString('spreadsheetId'),
    sheetName: t.exposeString('sheetName'),
    folderId: t.exposeString('folderId', { nullable: true }),
    appendMode: t.exposeBoolean('appendMode'),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    integration: t.relation('integration', {
      type: IntegrationRef,
      nullable: false
    }),
    journey: t.relation('journey', {
      type: JourneyRef,
      nullable: false
    })
  })
})
