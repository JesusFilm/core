import { builder } from '../../../builder'

export const CampaignRegionLanguageUpdateInput = builder.inputType(
  'CampaignRegionLanguageUpdateInput',
  {
    fields: (t) => ({
      url: t.string({
        required: false,
        description:
          'A pasted journey link: an admin link (`/journeys/<id>`) or the journey’s public URL on any domain (`/<slug>`). Resolves to a live-published journey of any team and links it, snapshotting its title and description; the Campaign QR Code is created or retargeted in the same step.'
      }),
      journeyId: t.id({
        required: false,
        description:
          'Link a live-published journey by id, or `null` to unlink the current journey, which deletes its Campaign QR Code and short link. Ignored when `url` is given.'
      }),
      title: t.string({
        required: false,
        description:
          'Edit the snapshotted title; at most 200 characters. Null clears it.'
      }),
      description: t.string({
        required: false,
        description:
          'Edit the snapshotted description; at most 1000 characters. Null clears it.'
      })
    })
  }
)
