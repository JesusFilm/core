import { MockedProvider } from '@apollo/client/testing/react'
import Button from '@mui/material/Button'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement, useState } from 'react'

import { CommandProvider, useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import {
  CampaignPageKind,
  CampaignStatus
} from '../../../../__generated__/globalTypes'
import { CAMPAIGN_PUBLISH } from '../../../libs/useCampaignPublishMutation'
import { CAMPAIGN_UNPUBLISH } from '../../../libs/useCampaignUnpublishMutation'
import type { CanvasView } from '../Canvas'
import { campaign, publishedCampaign } from '../data'

import { TopBar } from './TopBar'

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

function AddCommandButton(): ReactElement {
  const { add } = useCommand()
  return (
    <Button
      onClick={() =>
        add({
          parameters: { execute: undefined, undo: undefined },
          execute: () => undefined
        })
      }
    >
      Add command
    </Button>
  )
}

interface HarnessProps {
  campaign?: Campaign
  isManager?: boolean
}

function Harness({
  campaign: campaignProp = campaign,
  isManager = true
}: HarnessProps): ReactElement {
  const [pageKind, setPageKind] = useState(CampaignPageKind.landing)
  const [previewLanguageId, setPreviewLanguageId] = useState('529')
  const [view, setView] = useState<CanvasView>('desktop')
  return (
    <MockedProvider mocks={[publishMock, unpublishMock]}>
      <SnackbarProvider>
        <CommandProvider>
          <AddCommandButton />
          <span data-testid="PageKind">{pageKind}</span>
          <span data-testid="PreviewLanguage">{previewLanguageId}</span>
          <span data-testid="View">{view}</span>
          <TopBar
            campaign={campaignProp}
            pageKind={pageKind}
            onPageKindChange={setPageKind}
            previewLanguageId={previewLanguageId}
            onPreviewLanguageChange={setPreviewLanguageId}
            view={view}
            onViewChange={setView}
            isManager={isManager}
          />
        </CommandProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('TopBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists the landing page and the Region Page in the page selector', () => {
    render(<Harness />)

    fireEvent.mouseDown(screen.getByRole('combobox', { name: /^Page/ }))
    expect(
      screen.getByRole('option', { name: 'Landing page' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Region page' })
    ).toBeInTheDocument()
  })

  it('keeps the Command history when switching pages', () => {
    render(<Harness />)

    fireEvent.click(screen.getByRole('button', { name: 'Add command' }))
    expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled()

    fireEvent.mouseDown(screen.getByRole('combobox', { name: /^Page/ }))
    fireEvent.click(screen.getByRole('option', { name: 'Region page' }))
    expect(screen.getByTestId('PageKind')).toHaveTextContent('regionTemplate')
    expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(screen.getByRole('button', { name: 'Redo' })).toBeEnabled()
  })

  it("offers the campaign's languages as the preview language", () => {
    render(<Harness />)

    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: /^Preview language/ })
    )
    fireEvent.click(screen.getByRole('option', { name: 'Français' }))
    expect(screen.getByTestId('PreviewLanguage')).toHaveTextContent('496')
  })

  it('toggles Desktop and Phone as a view, not a Command', () => {
    render(<Harness />)

    fireEvent.click(screen.getByRole('button', { name: 'Phone' }))
    expect(screen.getByTestId('View')).toHaveTextContent('phone')
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
  })

  it('opens the root-domain campaign address in a new tab', () => {
    render(<Harness />)

    const link = screen.getByRole('link', { name: 'Open page' })
    expect(link).toHaveAttribute(
      'href',
      'https://your.nextstep.is/campaign/christmas-2026'
    )
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('shows the draft status chip and Publish for a draft', () => {
    render(<Harness />)

    expect(screen.getByTestId('CampaignStatusChip')).toHaveTextContent('Draft')
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Unpublish' })
    ).not.toBeInTheDocument()
  })

  it('runs campaignPublish with no confirmation and adds no Command', async () => {
    render(<Harness />)

    fireEvent.click(screen.getByRole('button', { name: 'Publish' }))
    await waitFor(() => expect(publishResult).toHaveBeenCalled())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
  })

  it('shows the published status chip and Unpublish when published', () => {
    render(<Harness campaign={publishedCampaign} />)

    expect(screen.getByTestId('CampaignStatusChip')).toHaveTextContent(
      'Published'
    )
    expect(
      screen.getByRole('button', { name: 'Unpublish' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Publish' })
    ).not.toBeInTheDocument()
  })

  it('confirms before unpublishing, stating that journeys and QR codes keep working', async () => {
    render(<Harness campaign={publishedCampaign} />)

    fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }))
    const dialog = screen.getByTestId('CampaignUnpublishDialog')
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
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
  })

  it('does not unpublish when the confirmation is cancelled', () => {
    render(<Harness campaign={publishedCampaign} />)

    fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }))
    const dialog = screen.getByTestId('CampaignUnpublishDialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(unpublishResult).not.toHaveBeenCalled()
  })

  it('keeps Publish for members disabled', () => {
    render(<Harness isManager={false} />)

    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
  })

  it('has no Save button, Unsaved chip or save indicator', () => {
    render(<Harness />)

    expect(
      screen.queryByRole('button', { name: 'Save' })
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Unsaved')).not.toBeInTheDocument()
    expect(screen.queryByText(/Saving/)).not.toBeInTheDocument()
  })
})
