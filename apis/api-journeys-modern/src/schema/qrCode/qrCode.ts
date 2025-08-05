import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

// Define ShortLink interface for federation
const ShortLink = builder
  .externalRef('ShortLink', builder.selection<{ id: string }>('id'))
  .implement({
    fields: (t) => ({
      id: t.exposeID('id')
    })
  })

// Define QrCode object type
export const QrCodeRef = builder.prismaObject('QrCode', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id'),
    teamId: t.exposeID('teamId'),
    journeyId: t.exposeID('journeyId'),
    toJourneyId: t.exposeString('toJourneyId'),
    toBlockId: t.exposeString('toBlockId', { nullable: true }),
    shortLinkId: t.exposeString('shortLinkId'),
    color: t.exposeString('color', { nullable: true }),
    backgroundColor: t.exposeString('backgroundColor', { nullable: true }),
    team: t.relation('team', { nullable: true }),
    journey: t.relation('journey', { nullable: true }),
    shortLink: t.field({
      type: ShortLink,
      resolve: (qrCode) => ({ id: qrCode.shortLinkId })
    })
  })
})

builder.asEntity(QrCodeRef, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async (qrCode) => {
    return await prisma.qrCode.findUnique({
      where: { id: qrCode.id }
    })
  }
})
