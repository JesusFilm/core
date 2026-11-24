import { builder } from '../../builder'

export const CustomDomainCreateInput = builder.inputType(
  'CustomDomainCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      teamId: t.string({ required: true }),
      name: t.string({ required: true }),
      journeyCollectionId: t.id({ required: false }),
      routeAllTeamJourneys: t.boolean({ required: false }),
      campaignId: t.id({
        required: false,
        description:
          "Campaign Domain: the team's campaign this domain belongs to. It then serves only that campaign at `/` and `/<regionSlug>`, never team journeys, so `routeAllTeamJourneys` is false and `journeyCollectionId` must be omitted. One domain per campaign; needs campaign Update as well as team manager."
      })
    })
  }
)
