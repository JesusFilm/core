import { builder } from '../../../../builder'
import { TEXT_CAPS } from '../../../validation'

export const CampaignJourneyBlockUpdateInput = builder.inputType(
  'CampaignJourneyBlockUpdateInput',
  {
    fields: (t) => ({
      title: t.string({
        required: false,
        description: `Default-language title. At most ${TEXT_CAPS.journeyTitle} characters.`
      }),
      description: t.string({
        required: false,
        description: `Default-language description. At most ${TEXT_CAPS.journeyDescription} characters.`
      }),
      snapshotEdited: t.boolean({
        required: false,
        description:
          'Set the edited flag outright, for an undo that writes a previous title and description back together with the flag they had. Without it, editing `title` or `description` marks the snapshot edited.'
      })
    })
  }
)
