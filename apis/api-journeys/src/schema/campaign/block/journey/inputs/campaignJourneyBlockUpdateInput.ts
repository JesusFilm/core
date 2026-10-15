import { builder } from '../../../../builder'

export const CampaignJourneyBlockUpdateInput = builder.inputType(
  'CampaignJourneyBlockUpdateInput',
  {
    fields: (t) => ({
      title: t.string({
        required: false,
        description: 'Default-language title. At most 200 characters.'
      }),
      description: t.string({
        required: false,
        description: 'Default-language description. At most 1000 characters.'
      }),
      snapshotEdited: t.boolean({
        required: false,
        description:
          'Set the edited flag outright, for an undo that writes a previous title and description back together with the flag they had. Without it, editing `title` or `description` marks the snapshot edited.'
      })
    })
  }
)
