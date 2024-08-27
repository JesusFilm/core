import { builder } from '../../builder'

builder.prismaObject('VideoSubtitle', {
  fields: (t) => ({
    id: t.exposeID('id'),
    languageId: t.exposeID('languageId'),
    primary: t.exposeBoolean('primary'),
    edition: t.exposeString('edition'),
    vttSrc: t.exposeString('vttSrc', { nullable: true }),
    srtSrc: t.exposeString('srtSrc', { nullable: true })
  })
})
