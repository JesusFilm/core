import {
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLResolveInfo
} from 'graphql'

import { schema } from '../../schema'

import { resolveCampaignActionType } from './campaignAction'

describe('CampaignAction', () => {
  const info = {} as unknown as GraphQLResolveInfo
  const campaignAction = schema.getType(
    'CampaignAction'
  ) as GraphQLInterfaceType

  function isTypeOf(typename: string, action: Record<string, unknown>) {
    const type = schema.getType(typename) as GraphQLObjectType
    return type.isTypeOf?.(action, {}, info)
  }

  it('resolves blockId to CampaignScrollToBlockAction', () => {
    const action = { blockId: 'heroId', regionId: null, url: null }
    expect(resolveCampaignActionType(action)).toBe(
      'CampaignScrollToBlockAction'
    )
    expect(campaignAction.resolveType?.(action, {}, info, campaignAction)).toBe(
      'CampaignScrollToBlockAction'
    )
    expect(isTypeOf('CampaignScrollToBlockAction', action)).toBe(true)
    expect(isTypeOf('CampaignLinkAction', action)).toBe(false)
  })

  it('resolves regionId to CampaignNavigateToRegionAction', () => {
    const action = { blockId: null, regionId: 'eurRegionId', url: null }
    expect(resolveCampaignActionType(action)).toBe(
      'CampaignNavigateToRegionAction'
    )
    expect(campaignAction.resolveType?.(action, {}, info, campaignAction)).toBe(
      'CampaignNavigateToRegionAction'
    )
    expect(isTypeOf('CampaignNavigateToRegionAction', action)).toBe(true)
    expect(isTypeOf('CampaignLinkAction', action)).toBe(false)
  })

  it('resolves url to CampaignLinkAction', () => {
    const action = { blockId: null, regionId: null, url: 'https://x.test' }
    expect(resolveCampaignActionType(action)).toBe('CampaignLinkAction')
    expect(campaignAction.resolveType?.(action, {}, info, campaignAction)).toBe(
      'CampaignLinkAction'
    )
    expect(isTypeOf('CampaignLinkAction', action)).toBe(true)
    expect(isTypeOf('CampaignScrollToBlockAction', action)).toBe(false)
    expect(isTypeOf('CampaignNavigateToRegionAction', action)).toBe(false)
  })

  it('resolves a row with every target null to CampaignNavigateToRegionAction (region deleted)', () => {
    const action = { blockId: null, regionId: null, url: null }
    expect(resolveCampaignActionType(action)).toBe(
      'CampaignNavigateToRegionAction'
    )
    expect(isTypeOf('CampaignNavigateToRegionAction', action)).toBe(true)
    expect(isTypeOf('CampaignLinkAction', action)).toBe(false)
  })

  it('prefers blockId over regionId and url when more than one is populated', () => {
    expect(
      resolveCampaignActionType({ blockId: 'heroId', regionId: 'eurRegionId' })
    ).toBe('CampaignScrollToBlockAction')
    expect(
      resolveCampaignActionType({ blockId: 'heroId', url: 'https://x.test' })
    ).toBe('CampaignScrollToBlockAction')
  })

  it('implements the CampaignAction interface on all three typenames', () => {
    for (const typename of [
      'CampaignLinkAction',
      'CampaignScrollToBlockAction',
      'CampaignNavigateToRegionAction'
    ]) {
      const type = schema.getType(typename) as GraphQLObjectType
      expect(type.getInterfaces().map((i) => i.name)).toContain(
        'CampaignAction'
      )
    }
  })
})
