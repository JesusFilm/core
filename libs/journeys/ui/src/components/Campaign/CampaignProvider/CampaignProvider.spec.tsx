import { render } from '@testing-library/react'
import { ReactElement } from 'react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { campaignPublic } from '../testData'

import { CampaignProvider, useCampaign } from './CampaignProvider'
import type { CampaignContextValue } from './CampaignProvider'

describe('CampaignProvider', () => {
  const pageBlockIds = new Set(['heroId'])
  const seen: CampaignContextValue[] = []

  function Consumer(): ReactElement {
    seen.push(useCampaign())
    return <></>
  }

  function providerTree(pageKind = CampaignPageKind.landing): ReactElement {
    // A fresh `value` object every render, as `CampaignPage` passes it.
    return (
      <CampaignProvider
        value={{
          campaign: campaignPublic,
          pageKind,
          region: null,
          pageBlockIds,
          pageHeadingBlockId: 'heroId'
        }}
      >
        <Consumer />
      </CampaignProvider>
    )
  }

  beforeEach(() => {
    seen.length = 0
  })

  it('keeps the context value the same object across re-renders with equal fields', () => {
    const { rerender } = render(providerTree())
    rerender(providerTree())
    expect(seen).toHaveLength(2)
    expect(seen[1]).toBe(seen[0])
  })

  it('builds a new context value when a field changes', () => {
    const { rerender } = render(providerTree())
    rerender(providerTree(CampaignPageKind.regionTemplate))
    expect(seen[1]).not.toBe(seen[0])
    expect(seen[1].pageKind).toBe(CampaignPageKind.regionTemplate)
  })
})
