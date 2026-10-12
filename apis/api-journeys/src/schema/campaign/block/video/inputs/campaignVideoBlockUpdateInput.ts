import { builder } from '../../../../builder'

export const CampaignVideoBlockUpdateInput = builder.inputType(
  'CampaignVideoBlockUpdateInput',
  {
    description:
      'The author’s default-language overrides. Null (or empty) falls back to the source text: read live for a Watch video, re-read from YouTube or Mux otherwise.',
    fields: (t) => ({
      title: t.string({
        required: false,
        description: 'At most 200 characters.'
      }),
      description: t.string({
        required: false,
        description: 'At most 1000 characters.'
      })
    })
  }
)
