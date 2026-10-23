import { builder } from '../../builder'

export const CustomDomainUpdateInput = builder.inputType(
  'CustomDomainUpdateInput',
  {
    fields: (t) => ({
      journeyCollectionId: t.id({ required: false }),
      routeAllTeamJourneys: t.boolean({ required: false }),
      campaignId: t.id({
        required: false,
        description:
          "Campaign Root: the team's campaign this domain serves at `/` and `/<regionSlug>`; null clears it. Omit to leave it unchanged. Independent of `routeAllTeamJourneys` and `journeyCollectionId`."
      })
    })
  }
)
