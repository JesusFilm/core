import { builder } from '../builder'

export const JourneyThemeRef = builder.prismaObject('JourneyTheme', {
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeID('journeyId'),
    userId: t.exposeID('userId'),
    headerFont: t.exposeString('headerFont', { nullable: true }),
    bodyFont: t.exposeString('bodyFont', { nullable: true }),
    labelFont: t.exposeString('labelFont', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    journey: t.relation('journey')
  })
})
