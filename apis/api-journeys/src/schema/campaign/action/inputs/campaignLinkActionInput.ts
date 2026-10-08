import { builder } from '../../../builder'

export const CampaignLinkActionInput = builder.inputType(
  'CampaignLinkActionInput',
  {
    fields: (t) => ({
      url: t.string({
        required: true,
        description: 'An https address of at most 2048 characters.'
      }),
      target: t.string({
        required: false,
        description:
          '`_blank` to open in a new tab; null for the same tab. Any other value is rejected.'
      })
    })
  }
)
