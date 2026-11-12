import { builder } from '../builder'
import { canReadJourney } from '../journey/journeyReadAccess'

export const JourneyThemeRef = builder.prismaObject('JourneyTheme', {
  shareable: true,
  authScopes: (theme, context) => canReadJourney(theme.journeyId, context),
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    journeyId: t.exposeID('journeyId', { nullable: false }),
    userId: t.exposeID('userId', { nullable: false }),
    headerFont: t.exposeString('headerFont', { nullable: true }),
    bodyFont: t.exposeString('bodyFont', { nullable: true }),
    labelFont: t.exposeString('labelFont', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    journey: t.relation('journey', { nullable: false })
  })
})
