import { ImageBlock } from '../block/image/image'
import { builder } from '../builder'
import { JourneyStatus } from '../journey/enums'
import { Language } from '../language'

// Narrow DTO for the journeys attached to a Campaign — the same shape as
// `TemplateGalleryItem` plus `status`, so the admin builder can flag drafts
// (the public `/embed/<slug>` route 404s on drafts). Deliberately NOT the
// full Journey type: `campaignBySlug` serves anonymous traffic and must not
// expose Journey-wide relations (userJourneys, team.userTeams, blocks…).
// Adding a field here requires re-checking the public-context exposure.
export const CampaignJourneyItemRef = builder.prismaObject('Journey', {
  variant: 'CampaignJourneyItem',
  description:
    'A journey attached to a Campaign, narrowed to the fields the public renderer and the admin builder consume. Backed by the underlying Journey row but exposed as a separate type so the anonymous query surface cannot traverse to Journey-wide relations.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    title: t.exposeString('title', { nullable: false }),
    description: t.exposeString('description', { nullable: true }),
    slug: t.exposeString('slug', { nullable: false }),
    status: t.expose('status', { type: JourneyStatus, nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    template: t.exposeBoolean('template', { nullable: true }),
    customizable: t.exposeBoolean('customizable', { nullable: true }),
    website: t.exposeBoolean('website', { nullable: true }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: (journey) => ({ id: journey.languageId ?? '529' })
    }),
    primaryImageBlock: t.relation('primaryImageBlock', {
      nullable: true,
      type: ImageBlock
    })
  })
})
