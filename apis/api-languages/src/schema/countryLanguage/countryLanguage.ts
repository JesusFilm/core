import { builder } from '../builder'

builder.prismaObject('CountryLanguage', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    language: t.relation('language', { nullable: false }),
    country: t.relation('country', { nullable: false }),
    speakers: t.exposeInt('speakers', { nullable: false }),
    displaySpeakers: t.exposeInt('displaySpeakers'),
    primary: t.exposeBoolean('primary', { nullable: false }),
    suggested: t.exposeBoolean('suggested', { nullable: false }),
    order: t.exposeInt('order')
  })
})
