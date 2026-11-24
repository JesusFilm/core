import { builder } from '../../builder'

export const ShortLinkStatsFilter = builder.inputType('ShortLinkStatsFilter', {
  fields: (t) => ({
    linkId: t.string({ required: false }),
    campaignId: t.string({ required: false }),
    hostname: t.string({ required: false }),
    videoId: t.string({ required: false }),
    youtubeVideoId: t.string({ required: false }),
    from: t.field({
      type: 'DateTime',
      required: true,
      description: 'inclusive start of the range'
    }),
    to: t.field({
      type: 'DateTime',
      required: true,
      description: 'exclusive end of the range'
    })
  })
})
