import { builder } from '../builder'
import { IntegrationRef } from '../integration/integration'
import { JourneyRef } from '../journey/journey'

export const GoogleSheetsSync = builder.prismaObject('GoogleSheetsSync', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    teamId: t.exposeID('teamId', { nullable: false }),
    journeyId: t.exposeID('journeyId', { nullable: false }),
    integrationId: t.exposeID('integrationId', { nullable: true }),
    spreadsheetId: t.exposeID('spreadsheetId', { nullable: false }),
    sheetName: t.exposeString('sheetName'),
    folderId: t.exposeString('folderId', { nullable: true }),
    email: t.exposeString('email', { nullable: true }),
    deletedAt: t.expose('deletedAt', { type: 'DateTime', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    integration: t.relation('integration', {
      type: IntegrationRef,
      nullable: true
    }),
    journey: t.relation('journey', {
      type: JourneyRef,
      nullable: false
    })
  })
})
