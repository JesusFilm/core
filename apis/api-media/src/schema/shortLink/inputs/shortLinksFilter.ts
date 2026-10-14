import { builder } from '../../builder'
import { Service } from '../../enums/service'
import { ShortLinkAssetClass } from '../enums/shortLinkAssetClass'
import { ShortLinkPlacement } from '../enums/shortLinkPlacement'
import { ShortLinkStatus } from '../enums/shortLinkStatus'

export const ShortLinksFilter = builder.inputType('ShortLinksFilter', {
  fields: (t) => ({
    hostname: t.string({
      required: false,
      description:
        'the hostname including subdomain, domain, and TLD, but excluding port'
    }),
    search: t.string({
      required: false,
      description:
        'case-insensitive match against pathname, destination, name, description and youtubeVideoId'
    }),
    status: t.field({ type: ShortLinkStatus, required: false }),
    assetClass: t.field({ type: ShortLinkAssetClass, required: false }),
    campaignId: t.string({ required: false }),
    placement: t.field({ type: ShortLinkPlacement, required: false }),
    videoId: t.string({ required: false }),
    youtubeVideoId: t.string({ required: false }),
    tag: t.string({ required: false }),
    service: t.field({ type: Service, required: false }),
    global: t.boolean({
      required: false,
      description:
        'only global links (true) or only domain-scoped links (false)'
    }),
    includeDeleted: t.boolean({
      required: false,
      description: 'include soft-deleted links (default false)'
    })
  })
})

export type ShortLinksFilterInput = typeof ShortLinksFilter.$inferInput
