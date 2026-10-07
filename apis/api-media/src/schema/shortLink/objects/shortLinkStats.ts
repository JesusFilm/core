import { builder } from '../../builder'
import type {
  ShortLinkStatsPoint as ShortLinkStatsPointShape,
  ShortLinkStats as ShortLinkStatsShape
} from '../analytics'

export const ShortLinkStatsPoint = builder
  .objectRef<ShortLinkStatsPointShape>('ShortLinkStatsPoint')
  .implement({
    description: 'One bucket of a short link scan breakdown',
    fields: (t) => ({
      key: t.exposeString('key', { nullable: false }),
      count: t.exposeInt('count', { nullable: false }),
      qrCount: t.exposeInt('qrCount', {
        nullable: false,
        description: 'the subset of count attributed to a QR scan'
      })
    })
  })

export const ShortLinkStats = builder
  .objectRef<ShortLinkStatsShape>('ShortLinkStats')
  .implement({
    description: 'Redirect counts for a date range, with breakdowns',
    fields: (t) => ({
      total: t.exposeInt('total', { nullable: false }),
      qr: t.exposeInt('qr', { nullable: false }),
      direct: t.exposeInt('direct', { nullable: false }),
      byDay: t.expose('byDay', {
        type: [ShortLinkStatsPoint],
        nullable: false,
        description: 'key = YYYY-MM-DD (UTC)'
      }),
      byLink: t.expose('byLink', {
        type: [ShortLinkStatsPoint],
        nullable: false,
        description: 'key = short link id'
      }),
      byCampaign: t.expose('byCampaign', {
        type: [ShortLinkStatsPoint],
        nullable: false,
        description: 'key = campaign id'
      }),
      byCountry: t.expose('byCountry', {
        type: [ShortLinkStatsPoint],
        nullable: false
      }),
      byDeviceClass: t.expose('byDeviceClass', {
        type: [ShortLinkStatsPoint],
        nullable: false
      }),
      byPlacement: t.expose('byPlacement', {
        type: [ShortLinkStatsPoint],
        nullable: false
      }),
      byReferrerHost: t.expose('byReferrerHost', {
        type: [ShortLinkStatsPoint],
        nullable: false
      }),
      byAttribution: t.expose('byAttribution', {
        type: [ShortLinkStatsPoint],
        nullable: false
      })
    })
  })
