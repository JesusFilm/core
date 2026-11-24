import { builder } from '../../../builder'
import { LINK_URL_MAX_LENGTH } from '../../validation'

export const CampaignLinkActionInput = builder.inputType(
  'CampaignLinkActionInput',
  {
    fields: (t) => ({
      url: t.string({
        required: true,
        description: `An https address of at most ${LINK_URL_MAX_LENGTH} characters.`
      }),
      target: t.string({
        required: false,
        description:
          '`_blank` to open in a new tab; null for the same tab. Any other value is rejected.'
      })
    })
  }
)
