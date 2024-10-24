import { builder } from '../builder'

builder.prismaObject('VideoEdition', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name', { nullable: true }),
    videoVariants: t.relation('videoVariants'),
    videoSubtitles: t.relation('videoSubtitles')
  })
})
