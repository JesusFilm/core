import { builder } from '../../builder'
import { TemplateGalleryPageMediaInput } from '../../templateGalleryPage/inputs'

// Deliberately omits status, publishedAt, id, teamId, createdAt, updatedAt —
// those are either immutable or transitioned via dedicated mutations
// (campaignPublish / campaignUnpublish).
export const CampaignUpdateInput = builder.inputType('CampaignUpdateInput', {
  description:
    'Input for editing a Campaign. Field omitted = leave the existing value alone. Field set to `null` = clear (only meaningful for nullable fields).',
  fields: (t) => ({
    title: t.string({
      required: false,
      description:
        'Updated display title. Does NOT regenerate the slug — use `slug` to change the slug.'
    }),
    eyebrow: t.string({
      required: false,
      description: 'Updated kicker. Pass `null` to clear.'
    }),
    tagline: t.string({
      required: false,
      description: 'Updated strapline. Pass `null` to clear.'
    }),
    description: t.string({
      required: false,
      description: 'Updated long-form description.'
    }),
    slug: t.string({
      required: false,
      description:
        'Updated public slug. Must match `^[a-z0-9]+(-[a-z0-9]+)*$`, max 200 characters, not be in the reserved list, and not be in use by another campaign. Changing the slug breaks any external links to the old URL.'
    }),
    backgroundImageSrc: t.string({
      required: false,
      description:
        'Optional https hero background image URL. Pass `null` to clear. Rejected if not https.'
    }),
    backgroundImageAlt: t.string({
      required: false,
      description: 'Optional hero background alt text. Pass `null` to clear.'
    }),
    statsFrom: t.field({
      type: 'DateTimeISO',
      required: false,
      description: 'Updated lower bound of the public country-stats date range.'
    }),
    shareJourneyIds: t.idList({
      required: false,
      description:
        "When provided, replaces the campaign's share-journey list with these journeys in this exact order (existing `share` rows are deleted then recreated). Cross-team, template-flagged and soft-deleted ids are silently filtered out. Omit to leave the list unchanged. Max 100."
    }),
    templateJourneyIds: t.idList({
      required: false,
      description:
        "When provided, replaces the campaign's template-journey list with these journeys in this exact order (existing `template` rows are deleted then recreated). Cross-team, non-template and soft-deleted ids are silently filtered out. Omit to leave the list unchanged. Max 100."
    }),
    media: t.field({
      type: TemplateGalleryPageMediaInput,
      required: false,
      description:
        'Embedded hero media. Omit (or pass `null`) to leave the existing media untouched — there is no media delete. When an object is supplied, `type` (`link`/`mux`/`none`) selects what renders and each payload slot merges independently: for `url` and `muxVideoId`, omit to leave the stored value, pass `null` to clear that slot, or pass a value to set/replace it. Hide everything with `type: none`.'
    })
  })
})
