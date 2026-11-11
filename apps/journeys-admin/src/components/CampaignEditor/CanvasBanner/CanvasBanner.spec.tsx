import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { campaign, campaignWithRegions } from '../data'
import { firstRunHintKey } from '../FirstRunHint'
import { StaticEditor } from '../testing'

import { CanvasBanner } from './CanvasBanner'

function renderBanner(
  campaignProp = campaign,
  initialState = {}
): ReturnType<typeof render> {
  return render(
    <MockedProvider>
      <SnackbarProvider>
        <StaticEditor campaign={campaignProp} initialState={initialState}>
          <CanvasBanner />
        </StaticEditor>
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('CanvasBanner', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('floats over the canvas without taking layout height', () => {
    renderBanner()

    expect(screen.getByTestId('CampaignCanvasBanner')).toHaveStyle({
      position: 'absolute',
      top: '16px'
    })
  })

  it('shows the first-run hint with its new wording once per campaign', () => {
    const { unmount } = renderBanner()

    expect(screen.getByTestId('CampaignFirstRunHint')).toHaveTextContent(
      'Pick anything on the page or in the Navigator, then change it in the Inspector.'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByTestId('CampaignFirstRunHint')).not.toBeInTheDocument()
    expect(localStorage.getItem(firstRunHintKey(campaign.id))).toBe('true')

    unmount()
    renderBanner()
    expect(screen.queryByTestId('CampaignFirstRunHint')).not.toBeInTheDocument()
  })

  it('shows the hint again for another campaign', () => {
    localStorage.setItem(firstRunHintKey(campaign.id), 'true')

    renderBanner({ ...campaign, id: 'otherCampaignId' })

    expect(screen.getByTestId('CampaignFirstRunHint')).toBeInTheDocument()
  })

  it('shows the orphan page bar with List on switcher on an unlisted region’s page', () => {
    renderBanner(campaignWithRegions, {
      pageKind: CampaignPageKind.regionTemplate,
      regionId: 'afrRegionId'
    })

    expect(screen.getByTestId('CampaignOrphanBanner')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'List on switcher' })
    ).toBeInTheDocument()
  })

  it('shows no orphan bar on a listed region’s page or the landing page', () => {
    const { unmount } = renderBanner(campaignWithRegions, {
      pageKind: CampaignPageKind.regionTemplate,
      regionId: 'eurRegionId'
    })
    expect(screen.queryByTestId('CampaignOrphanBanner')).not.toBeInTheDocument()

    unmount()
    renderBanner(campaignWithRegions)
    expect(screen.queryByTestId('CampaignOrphanBanner')).not.toBeInTheDocument()
  })
})
