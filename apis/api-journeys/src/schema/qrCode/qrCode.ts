import { builder } from '../builder'

const ShortLink = builder
  .externalRef('ShortLink', builder.selection<{ id: string }>('id'))
  .implement({
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false })
    })
  })

export const QrCodeRef = builder.prismaObject('QrCode', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    toJourneyId: t.exposeString('toJourneyId'),
    color: t.exposeString('color', { nullable: true }),
    backgroundColor: t.exposeString('backgroundColor', { nullable: true }),
    team: t.relation('team', { nullable: true }),
    journey: t.relation('journey', { nullable: true }),
    shortLink: t.field({
      nullable: false,
      type: ShortLink,
      select: {
        shortLinkId: true
      },
      resolve: (qrCode) => ({ id: qrCode.shortLinkId })
    })
  })
})
