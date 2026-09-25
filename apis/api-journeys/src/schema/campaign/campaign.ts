import { builder } from '../builder'

import { CampaignCountryStatsRef } from './campaignCountryStats'
import { CampaignJourneyItemRef } from './campaignJourneyItem'
import { CampaignMediaPublicRef, CampaignMediaRef } from './campaignMedia'
import { CampaignStatus } from './enums'
import { getCampaignCountryStats } from './stats/getCampaignCountryStats'

// Every journey-derived field on a projection selects the SAME `journeys`
// relation shape so Pothos merges them into one query; role/team/template
// filtering happens in memory. `include: { journey: true }` (not
// nestedSelection) so `journey.teamId`/`template`/`status` — none of which are
// exposed on CampaignJourneyItem — are present for that filtering.
const adminJourneysSelect = {
  teamId: true,
  journeys: {
    include: { journey: true },
    where: { journey: { deletedAt: null } },
    orderBy: [{ role: 'asc' }, { order: 'asc' }]
  }
} as const

const publicJourneysSelect = {
  teamId: true,
  journeys: {
    include: { journey: true },
    where: { journey: { deletedAt: null, status: 'published' } },
    orderBy: [{ role: 'asc' }, { order: 'asc' }]
  }
} as const

type JourneyRow = {
  role: 'share' | 'template'
  journey: {
    teamId: string
    template: boolean | null
    status: string
  }
}

function pickJourneys<T extends JourneyRow>(
  campaignTeamId: string,
  rows: readonly T[],
  role: 'share' | 'template'
): T['journey'][] {
  return rows
    .filter(
      (row) =>
        row.role === role &&
        row.journey.teamId === campaignTeamId &&
        (role === 'template'
          ? row.journey.template === true
          : row.journey.template !== true)
    )
    .map((row) => row.journey)
}

const sharedScalarDescriptions = {
  slug: 'URL-safe identifier. The public page is reached at `/campaign/<slug>`. Must match `^[a-z0-9]+(-[a-z0-9]+)*$`, max 200 characters, and must not be in the reserved list. Mutable after publish — changing it breaks any external links to the old URL.',
  status:
    '`draft` hides the campaign from the public renderer; `published` exposes it via `campaignBySlug`.',
  publishedAt:
    'Timestamp of the first publish event. Monotonic — never re-set on subsequent unpublish/republish, and never cleared. Null while the campaign has not yet been published.',
  shareJourneys:
    'Share-panel journeys in display order: same-team, non-template, non-soft-deleted journeys attached with role `share`.',
  templateJourneys:
    'Customizable-collection journeys in display order: same-team, template-flagged, non-soft-deleted journeys attached with role `template`.'
}

// FULL projection — authenticated, team-scoped reads and every mutation
// return. Attached drafts are visible (with `status`) so the builder can warn.
export const CampaignRef = builder.prismaObject('Campaign', {
  description:
    'A team-curated, slug-addressable public campaign landing page bundling ordered `share` journeys (language share panel), ordered `template` journeys (customizable collection), hero copy/media and public country stats. The slug is mutable post-publish. `publishedAt` is monotonic.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    title: t.exposeString('title', { nullable: false }),
    slug: t.exposeString('slug', {
      nullable: false,
      description: sharedScalarDescriptions.slug
    }),
    eyebrow: t.exposeString('eyebrow', { nullable: true }),
    tagline: t.exposeString('tagline', { nullable: true }),
    description: t.exposeString('description', { nullable: false }),
    backgroundImageSrc: t.exposeString('backgroundImageSrc', {
      nullable: true
    }),
    backgroundImageAlt: t.exposeString('backgroundImageAlt', {
      nullable: true
    }),
    status: t.expose('status', {
      type: CampaignStatus,
      nullable: false,
      description: sharedScalarDescriptions.status
    }),
    publishedAt: t.expose('publishedAt', {
      type: 'DateTimeISO',
      nullable: true,
      description: sharedScalarDescriptions.publishedAt
    }),
    statsFrom: t.expose('statsFrom', {
      type: 'DateTimeISO',
      nullable: false,
      description: 'Lower bound of the country-stats date range.'
    }),
    createdAt: t.expose('createdAt', { type: 'DateTimeISO', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTimeISO', nullable: false }),
    team: t.relation('team', {
      nullable: false,
      description:
        'Owning team. The campaign is hard-deleted when the team is deleted.'
    }),
    shareJourneys: t.field({
      type: [CampaignJourneyItemRef],
      nullable: false,
      description: `${sharedScalarDescriptions.shareJourneys} Drafts are included on this authenticated projection.`,
      select: adminJourneysSelect,
      resolve: (campaign) =>
        pickJourneys(campaign.teamId, campaign.journeys, 'share')
    }),
    templateJourneys: t.field({
      type: [CampaignJourneyItemRef],
      nullable: false,
      description: `${sharedScalarDescriptions.templateJourneys} Drafts are included on this authenticated projection.`,
      select: adminJourneysSelect,
      resolve: (campaign) =>
        pickJourneys(campaign.teamId, campaign.journeys, 'template')
    }),
    media: t.relation('media', {
      type: CampaignMediaRef,
      nullable: true,
      description:
        'Embedded hero media with both retained payload slots and the raw `muxVideoId`. `null` only when the campaign has no media row.'
    }),
    // Authenticated country stats so the builder can show numbers for a draft.
    // Only PUBLISHED share journeys count — that is what the public page would
    // report, and drafts have no public traffic anyway.
    countryStats: t.field({
      type: CampaignCountryStatsRef,
      nullable: false,
      description:
        "Country breakdown of this campaign's published share-journey traffic. Live Plausible read — request it only where needed.",
      select: { ...adminJourneysSelect, statsFrom: true },
      resolve: async (campaign) =>
        await getCampaignCountryStats({
          teamId: campaign.teamId,
          journeyIds: pickJourneys(campaign.teamId, campaign.journeys, 'share')
            .filter((journey) => journey.status === 'published')
            .map((journey) => journey.id),
          statsFrom: campaign.statsFrom
        })
    })
  })
})

// PUBLIC projection — the `CampaignPublic` variant returned by the
// unauthenticated `campaignBySlug` read. No team/timestamps, journeys filtered
// to published, media gated to the active payload.
export const CampaignPublicRef = builder.prismaObject('Campaign', {
  variant: 'CampaignPublic',
  description:
    'Public projection of a Campaign, returned by the unauthenticated slug read. Journey lists contain only published journeys and `media` exposes only the active payload.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    title: t.exposeString('title', { nullable: false }),
    slug: t.exposeString('slug', {
      nullable: false,
      description: sharedScalarDescriptions.slug
    }),
    eyebrow: t.exposeString('eyebrow', { nullable: true }),
    tagline: t.exposeString('tagline', { nullable: true }),
    description: t.exposeString('description', { nullable: false }),
    backgroundImageSrc: t.exposeString('backgroundImageSrc', {
      nullable: true
    }),
    backgroundImageAlt: t.exposeString('backgroundImageAlt', {
      nullable: true
    }),
    status: t.expose('status', {
      type: CampaignStatus,
      nullable: false,
      description: sharedScalarDescriptions.status
    }),
    publishedAt: t.expose('publishedAt', {
      type: 'DateTimeISO',
      nullable: true,
      description: sharedScalarDescriptions.publishedAt
    }),
    shareJourneys: t.field({
      type: [CampaignJourneyItemRef],
      nullable: false,
      description: `${sharedScalarDescriptions.shareJourneys} Published journeys only.`,
      select: publicJourneysSelect,
      resolve: (campaign) =>
        pickJourneys(campaign.teamId, campaign.journeys, 'share')
    }),
    templateJourneys: t.field({
      type: [CampaignJourneyItemRef],
      nullable: false,
      description: `${sharedScalarDescriptions.templateJourneys} Published journeys only.`,
      select: publicJourneysSelect,
      resolve: (campaign) =>
        pickJourneys(campaign.teamId, campaign.journeys, 'template')
    }),
    media: t.field({
      type: CampaignMediaPublicRef,
      nullable: true,
      select: { media: true },
      description:
        'Embedded hero media, or `null` when nothing renders (no media, `type: none`, or the active slot is empty). Only the active payload is ever exposed.',
      resolve: (campaign) => {
        const media = campaign.media
        if (media == null) return null
        if (media.type === 'link' && media.embedUrl != null) return media
        if (media.type === 'mux' && media.muxPlaybackId != null) return media
        return null
      }
    })
  })
})
