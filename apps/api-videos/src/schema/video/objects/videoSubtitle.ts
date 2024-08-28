import { builder } from '../../builder'
import { Language } from '../../language'

builder.prismaObject('VideoSubtitle', {
  fields: (t) => ({
    id: t.exposeID('id'),
    languageId: t.exposeID('languageId'),
    primary: t.exposeBoolean('primary'),
    edition: t.exposeString('edition'),
    vttSrc: t.exposeString('vttSrc', { nullable: true }),
    srtSrc: t.exposeString('srtSrc', { nullable: true }),
    value: t.string({
      resolve: ({ vttSrc, srtSrc }) => vttSrc ?? srtSrc ?? ''
    }),
    language: t.field({
      type: Language,
      resolve: ({ languageId: id }) => ({ id })
    })
  })
})
