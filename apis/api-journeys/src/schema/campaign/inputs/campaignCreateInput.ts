import { builder } from '../../builder'
import { TemplateGalleryPageMediaInput } from '../../templateGalleryPage/inputs'

export const CampaignCreateInput = builder.inputType('CampaignCreateInput', {
  description:
    'Input for creating a new Campaign in `draft` status. The slug is server-generated from `title`.',
  fields: (t) => ({
    teamId: t.id({
      required: true,
      description: 'Owning team. Caller must be a member.'
    }),
    title: t.string({
      required: true,
      description:
        'Display title. Drives slug auto-generation: lowercased + hyphenated form of the title, max 200 characters, with the shared reserved-word list blocked. On collision the resolver tries `<base>-2`..`<base>-50`, then falls back to a 6-character random suffix.'
    }),
    eyebrow: t.string({
      required: false,
      description:
        'Optional short kicker shown above the title (e.g. "World Cup 2026 · Outreach").'
    }),
    tagline: t.string({
      required: false,
      description:
        'Optional one-line strapline shown between the eyebrow and the title.'
    }),
    description: t.string({
      required: false,
      description:
        'Optional long-form description shown under the title. Defaults to empty string when omitted.'
    }),
    backgroundImageSrc: t.string({
      required: false,
      description:
        'Optional https URL of the hero background image. Rejected if not https.'
    }),
    backgroundImageAlt: t.string({
      required: false,
      description: 'Optional alt text for the hero background image.'
    }),
    statsFrom: t.field({
      type: 'DateTimeISO',
      required: false,
      description:
        'Lower bound of the public country-stats date range. Defaults to the creation time; set it earlier to count views that happened before the campaign row existed.'
    }),
    shareJourneyIds: t.idList({
      required: false,
      description:
        'Optional initial share journeys (non-template journeys) in display order. Cross-team, template-flagged and soft-deleted ids are silently filtered out. Max 100.'
    }),
    templateJourneyIds: t.idList({
      required: false,
      description:
        'Optional initial template journeys in display order. Cross-team, non-template and soft-deleted ids are silently filtered out. Max 100.'
    }),
    media: t.field({
      type: TemplateGalleryPageMediaInput,
      required: false,
      description:
        'Optional embedded hero media. Same semantics as the TemplateGalleryPage media input: `type` (`link`/`mux`/`none`) selects what renders; supply `url` and/or `muxVideoId` to populate either slot.'
    })
  })
})
