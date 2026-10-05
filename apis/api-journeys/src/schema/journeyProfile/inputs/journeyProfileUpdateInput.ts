import { builder } from '../../builder'

export const JourneyProfileUpdateInput = builder.inputType(
  'JourneyProfileUpdateInput',
  {
    fields: (t) => ({
      lastActiveTeamId: t.string({ required: false }),
      journeyFlowBackButtonClicked: t.boolean({ required: false }),
      plausibleJourneyFlowViewed: t.boolean({ required: false }),
      plausibleDashboardViewed: t.boolean({ required: false })
    })
  }
)
