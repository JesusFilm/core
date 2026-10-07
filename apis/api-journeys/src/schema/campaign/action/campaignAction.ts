import { builder } from '../../builder'

export type CampaignActionTypename =
  | 'CampaignLinkAction'
  | 'CampaignScrollToBlockAction'
  | 'CampaignNavigateToRegionAction'

/**
 * Resolve a CampaignAction row to its typename by populated column, as the
 * journeys Action does: `blockId` ⇒ scroll, `regionId` ⇒ navigate to region,
 * else a web link.
 */
export function resolveCampaignActionType(action: {
  blockId?: string | null
  regionId?: string | null
}): CampaignActionTypename {
  if (action.blockId != null) return 'CampaignScrollToBlockAction'
  if (action.regionId != null) return 'CampaignNavigateToRegionAction'
  return 'CampaignLinkAction'
}

export const CampaignActionInterface = builder.prismaInterface(
  'CampaignAction',
  {
    name: 'CampaignAction',
    description:
      'What a CampaignButtonBlock does when pressed: a web link, a scroll to a block on the same page, or a navigation to a Campaign Region. One row per button, resolved by the populated column. Typenames are Campaign-prefixed so they never collide with the journeys Action kinds.',
    fields: (t) => ({
      parentBlockId: t.exposeID('campaignBlockId', {
        nullable: false,
        description: 'The CampaignButtonBlock this action belongs to.'
      }),
      parentBlock: t.relation('parentBlock', { nullable: false })
    }),
    resolveType: (action) => resolveCampaignActionType(action)
  }
)

export const CampaignLinkActionRef = builder.prismaObject('CampaignAction', {
  variant: 'CampaignLinkAction',
  interfaces: [CampaignActionInterface],
  isTypeOf: (action: any) =>
    resolveCampaignActionType(action) === 'CampaignLinkAction',
  description:
    'A web link: a journey, video or any https address. The url is validated as https and at most 2048 characters.',
  fields: (t) => ({
    url: t.string({
      nullable: false,
      resolve: (action) => action.url ?? ''
    }),
    target: t.exposeString('target', { nullable: true })
  })
})

export const CampaignScrollToBlockActionRef = builder.prismaObject(
  'CampaignAction',
  {
    variant: 'CampaignScrollToBlockAction',
    interfaces: [CampaignActionInterface],
    isTypeOf: (action: any) =>
      resolveCampaignActionType(action) === 'CampaignScrollToBlockAction',
    description:
      'Scroll to a Campaign Section on the same page. The renderer links to `#<blockId>`; a target on another page renders inert.',
    fields: (t) => ({
      blockId: t.string({
        nullable: false,
        resolve: (action) => action.blockId ?? ''
      })
    })
  }
)

export const CampaignNavigateToRegionActionRef = builder.prismaObject(
  'CampaignAction',
  {
    variant: 'CampaignNavigateToRegionAction',
    interfaces: [CampaignActionInterface],
    isTypeOf: (action: any) =>
      resolveCampaignActionType(action) === 'CampaignNavigateToRegionAction',
    description:
      "Navigate to a Campaign Region's page, carrying the visitor's Page Language. The target is set null when the region is deleted.",
    fields: (t) => ({
      regionId: t.string({
        nullable: false,
        resolve: (action) => action.regionId ?? ''
      })
    })
  }
)
