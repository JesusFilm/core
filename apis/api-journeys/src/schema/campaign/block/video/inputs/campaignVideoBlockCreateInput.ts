import { builder } from '../../../../builder'
import { VideoBlockSource } from '../../../../enums'

export const CampaignVideoBlockCreateInput = builder.inputType(
  'CampaignVideoBlockCreateInput',
  {
    description:
      'A Campaign Video as a child of a section: it fills the Media Slot of a hero or Featured Media section (replacing the block the slot held, `parentOrder: null`) or is appended as an explicit item of a video carousel (the next ordered child). A Watch video is a pasted `url` (`source: internal`); a YouTube or Mux video is its `videoId`.',
    fields: (t) => ({
      id: t.id({ required: false }),
      campaignId: t.id({ required: true }),
      parentBlockId: t.id({
        required: true,
        description:
          'The hero, Featured Media section or video carousel this item belongs to.'
      }),
      source: t.field({
        type: VideoBlockSource,
        required: true,
        description: '`internal` (Watch), `youTube` or `mux`.'
      }),
      videoId: t.id({
        required: false,
        description:
          'The YouTube or Mux video id (zod-validated, then fetched once); for `internal`, a known Watch Video id instead of `url`.'
      }),
      url: t.string({
        required: false,
        description:
          '`internal` only: a Watch address, resolved by the server through its variant slug.'
      }),
      title: t.string({
        required: false,
        description:
          'Title override, at most 200 characters; omitted or null shows the source title.'
      }),
      description: t.string({
        required: false,
        description:
          'Description override, at most 1000 characters; omitted or null shows the source text.'
      })
    })
  }
)
