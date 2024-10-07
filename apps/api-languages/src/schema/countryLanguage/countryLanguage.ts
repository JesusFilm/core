import { builder } from '../builder'

builder.prismaObject('CountryLanguage', {
  fields: (t) => ({
    id: t.exposeID('id'),
    language: t.relation('language'),
    country: t.relation('country'),
    speakers: t.exposeInt('speakers'),
    displaySpeakers: t.exposeInt('displaySpeakers', { nullable: true }),
    primary: t.exposeBoolean('primary'),
  }),
})
