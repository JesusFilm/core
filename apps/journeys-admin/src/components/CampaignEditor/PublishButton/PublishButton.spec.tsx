import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import {
  CampaignPageKind,
  CampaignStatus
} from '../../../../__generated__/globalTypes'
import { CAMPAIGN_PUBLISH } from '../../../libs/useCampaignPublishMutation'
import { CAMPAIGN_UNPUBLISH } from '../../../libs/useCampaignUnpublishMutation'
import { CampaignEditorState } from '../CampaignEditorProvider'
import { campaign, campaignWithRegions, publishedCampaign } from '../data'
import { CommandProbe, StaticEditor } from '../testing'

import { PublishButton } from './PublishButton'

const publishResult = vi.fn(() => ({
  data: {
    campaignPublish: {
      __typename: 'Campaign',
      id: 'campaignId',
      status: CampaignStatus.published,
      publishedAt: '2026-10-05T00:00:00.000Z'
    }
  }
}))

const unpublishResult = vi.fn(() => ({
  data: {
    campaignUnpublish: {
      __typename: 'Campaign',
      id: 'campaignId',
      status: CampaignStatus.draft,
      publishedAt: '2026-10-05T00:00:00.000Z'
    }
  }
}))

const publishMock = {
  request: { query: CAMPAIGN_PUBLISH, variables: { id: 'campaignId' } },
  result: publishResult
}

const unpublishMock = {
  request: { query: CAMPAIGN_UNPUBLISH, variables: { id: 'campaignId' } },
  result: unpublishResult
}

interface HarnessProps {
  campaign?: Campaign
  initialState?: Partial<CampaignEditorState>
}

function Harness({
  campaign: campaignOverride = campaign,
  initialState
}: HarnessProps): ReactElement {
  return (
    <SnackbarProvider>
      <StaticEditor
        campaign={campaignOverride}
        initialState={initialState}
        mocks={[publishMock, unpublishMock]}
      >
        <CommandProbe />
        <PublishButton />
      </StaticEditor>
    </SnackbarProvider>
  )
}

function openPopover(): void {
  fireEvent.click(screen.getByRole('button', { name: 'Publish status' }))
}

describe('PublishButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a grey draft dot and, in its popover, the draft copy with Publish', () => {
    render(<Harness />)

    expect(screen.getByTestId('PublishStatusDot')).toHaveAttribute(
      'data-status',
      'draft'
    )
    openPopover()

    expect(screen.getByTestId('PublishStatusCopy')).toHaveTextContent(
      'Draft. Edits are saved as you make them; nothing is public until you publish.'
    )
    expect(screen.getByRole('button', { name: 'Publish' })).toBeEnabled()
    expect(
      screen.queryByRole('button', { name: 'Unpublish' })
    ).not.toBeInTheDocument()
  })

  it('runs campaignPublish with no confirmation and adds no Command', async () => {
    render(<Harness />)
    openPopover()

    fireEvent.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => expect(publishResult).toHaveBeenCalled())
    expect(
      screen.queryByTestId('CampaignUnpublishDialog')
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('shows a green published dot and, in its popover, the published copy with Unpublish', () => {
    render(<Harness campaign={publishedCampaign} />)

    expect(screen.getByTestId('PublishStatusDot')).toHaveAttribute(
      'data-status',
      'published'
    )
    openPopover()

    expect(screen.getByTestId('PublishStatusCopy')).toHaveTextContent(
      'Published. Edits are saved as you make them and reach the public page shortly.'
    )
    expect(screen.getByRole('button', { name: 'Unpublish' })).toBeEnabled()
    expect(
      screen.queryByRole('button', { name: 'Publish' })
    ).not.toBeInTheDocument()
  })

  it('confirms before unpublishing, stating that journeys and QR codes keep working', async () => {
    render(<Harness campaign={publishedCampaign} />)
    openPopover()

    fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }))
    const dialog = await screen.findByTestId('CampaignUnpublishDialog')
    expect(dialog).toHaveTextContent(
      'The linked journeys and their QR codes keep working at their own URLs.'
    )
    expect(unpublishResult).not.toHaveBeenCalled()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Unpublish' }))
    await waitFor(() => expect(unpublishResult).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        screen.queryByTestId('CampaignUnpublishDialog')
      ).not.toBeInTheDocument()
    )
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('does not unpublish when the confirmation is cancelled', async () => {
    render(<Harness campaign={publishedCampaign} />)
    openPopover()

    fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }))
    const dialog = await screen.findByTestId('CampaignUnpublishDialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(unpublishResult).not.toHaveBeenCalled()
  })

  it('lets any member publish', () => {
    render(<Harness />)
    openPopover()

    expect(screen.getByRole('button', { name: 'Publish' })).toBeEnabled()
  })

  it('lets any member unpublish', () => {
    render(<Harness campaign={publishedCampaign} />)
    openPopover()

    expect(screen.getByRole('button', { name: 'Unpublish' })).toBeEnabled()
  })

  it('disables Refresh and open page on a draft, with a caption that the page goes live on publish', () => {
    render(<Harness />)
    openPopover()

    expect(
      screen.queryByRole('link', { name: 'Refresh and open page' })
    ).not.toBeInTheDocument()
    const button = screen.getByRole('button', { name: 'Refresh and open page' })
    expect(button).toBeDisabled()
    expect(button).toHaveAccessibleDescription(
      'The page goes live when you publish.'
    )
  })

  it('opens the campaign through the refresh route in a new tab', () => {
    render(<Harness campaign={publishedCampaign} />)
    openPopover()

    const link = screen.getByRole('link', { name: 'Refresh and open page' })
    expect(link).toHaveAttribute('href', '/api/campaign/open?id=campaignId')
    expect(link).toHaveAttribute('target', '_blank')
    expect(
      screen.queryByText('The page goes live when you publish.')
    ).not.toBeInTheDocument()
  })

  it('opens the rendered region’s page through the refresh route on a Region Page', () => {
    render(
      <Harness
        campaign={{
          ...campaignWithRegions,
          status: CampaignStatus.published
        }}
        initialState={{
          pageKind: CampaignPageKind.regionTemplate,
          regionId: 'afrRegionId'
        }}
      />
    )
    openPopover()

    expect(
      screen.getByRole('link', { name: 'Refresh and open page' })
    ).toHaveAttribute('href', '/api/campaign/open?id=campaignId&regionSlug=afr')
  })
})
