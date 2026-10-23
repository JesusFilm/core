import { builder } from '../../../../builder'
import { TEXT_CAPS } from '../../../validation'

export const CampaignVideoBlockUpdateInput = builder.inputType(
  'CampaignVideoBlockUpdateInput',
  {
    description:
      'The author’s default-language overrides. Null (or empty) falls back to the source text: read live for a Watch video, re-read from YouTube or Mux otherwise.',
    fields: (t) => ({
      title: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.videoTitle} characters.`
      }),
      description: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.videoDescription} characters.`
      })
    })
  }
)
