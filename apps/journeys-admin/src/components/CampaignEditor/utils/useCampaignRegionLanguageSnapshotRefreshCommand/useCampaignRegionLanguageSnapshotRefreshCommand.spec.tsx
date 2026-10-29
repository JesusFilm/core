import { MockLink } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_regions_languages as CampaignRegionLanguage } from '../../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import { CAMPAIGN_REGION_LANGUAGE_SNAPSHOT_REFRESH } from '../../../../libs/useCampaignRegionLanguageSnapshotRefreshMutation'
import { CAMPAIGN_REGION_LANGUAGE_UPDATE } from '../../../../libs/useCampaignRegionLanguageUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaignWithRegions, eurEnglish } from '../../data'
import { CommandProbe, QueriedEditor } from '../../testing'

import { useCampaignRegionLanguageSnapshotRefreshCommand } from './useCampaignRegionLanguageSnapshotRefreshCommand'

/** English, reworded by the author since it was linked; the journey itself says something newer. */
const edited: CampaignRegionLanguage = {
  ...eurEnglish,
  title: 'My Outreach title',
  description: 'My own description.',
  snapshotEdited: true,
  journey: {
    ...eurEnglish.journey!,
    title: 'Outreach in Europe 2026',
    description: 'The journey as it reads now.'
  }
}

const refreshMock = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_SNAPSHOT_REFRESH,
    variables: { id: 'eurRegionId-529' }
  },
  maxUsageCount: 2,
  result: vi.fn(() => ({
    data: {
      campaignRegionLanguageSnapshotRefresh: {
        ...edited,
        title: 'Outreach in Europe 2026',
        description: 'The journey as it reads now.',
        snapshotEdited: false
      }
    }
  }))
}

const undoMock = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_UPDATE,
    variables: {
      id: 'eurRegionId-529',
      input: {
        title: 'My Outreach title',
        description: 'My own description.',
        snapshotEdited: true
      }
    }
  },
  result: vi.fn(() => ({ data: { campaignRegionLanguageUpdate: edited } }))
}

/** Shows the English snapshot the provider sees and drives the hook. */
function Probe(): ReactElement {
  const { campaign } = useCampaignEditor()
  const { requestRefresh, pending, confirmRefresh, cancelRefresh } =
    useCampaignRegionLanguageSnapshotRefreshCommand()
  const { undo, redo } = useCommand()
  const english = campaign.regions[0].languages[0]
  return (
    <>
      <span data-testid="Snapshot">
        {english.title}|{english.description}
      </span>
      <span data-testid="Pending">{pending?.id ?? ''}</span>
      <button onClick={() => requestRefresh(english)}>Refresh</button>
      <button onClick={confirmRefresh}>Confirm</button>
      <button onClick={cancelRefresh}>Cancel</button>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
    </>
  )
}

const refusal = { errors: [{ message: 'The request was refused' }] }

function renderHook(
  english: CampaignRegionLanguage,
  mocks: MockLink.MockedResponse[] = [refreshMock, undoMock]
): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      campaign={{
        ...campaignWithRegions,
        regions: campaignWithRegions.regions.map((region) =>
          region.id === 'eurRegionId'
            ? { ...region, languages: [english, ...region.languages.slice(1)] }
            : region
        )
      }}
      initialState={{
        pageKind: CampaignPageKind.regionTemplate,
        regionId: 'eurRegionId',
        selectedBlockId: 'regionShareId'
      }}
      mocks={mocks}
    >
      <CommandProbe />
      <Probe />
    </QueriedEditor>
  )
}

describe('useCampaignRegionLanguageSnapshotRefreshCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('refreshes an unedited snapshot at once as a Command, with no confirmation', async () => {
    renderHook(eurEnglish)
    await screen.findByText('Refresh')

    fireEvent.click(screen.getByText('Refresh'))

    expect(screen.getByTestId('Pending')).toHaveTextContent('')
    await waitFor(() => expect(refreshMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('refreshes at once when the journey was only renamed, the author having edited nothing', async () => {
    renderHook({
      ...eurEnglish,
      journey: {
        ...eurEnglish.journey!,
        title: 'Renamed by the journey owner',
        description: 'Reworded by the journey owner.'
      }
    })
    await screen.findByText('Refresh')

    fireEvent.click(screen.getByText('Refresh'))

    expect(screen.getByTestId('Pending')).toHaveTextContent('')
    await waitFor(() => expect(refreshMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('holds an edited snapshot for confirmation, refreshing on confirm and dropping it on cancel', async () => {
    renderHook(edited)
    await screen.findByText('Refresh')

    fireEvent.click(screen.getByText('Refresh'))
    expect(screen.getByTestId('Pending')).toHaveTextContent('eurRegionId-529')
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')

    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.getByTestId('Pending')).toHaveTextContent('')
    expect(refreshMock.result).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('Refresh'))
    fireEvent.click(screen.getByText('Confirm'))

    expect(screen.getByTestId('Pending')).toHaveTextContent('')
    await waitFor(() =>
      expect(screen.getByTestId('Snapshot')).toHaveTextContent(
        'Outreach in Europe 2026|The journey as it reads now.'
      )
    )
    await waitFor(() => expect(refreshMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('raises the API message in the error snackbar when the refresh is refused', async () => {
    renderHook(eurEnglish, [{ ...refreshMock, result: refusal }])
    await screen.findByText('Refresh')

    fireEvent.click(screen.getByText('Refresh'))

    expect(
      await screen.findByText('The request was refused')
    ).toBeInTheDocument()
  })

  it('raises the API message when the undo write is refused', async () => {
    renderHook(edited, [refreshMock, { ...undoMock, result: refusal }])
    await screen.findByText('Refresh')
    fireEvent.click(screen.getByText('Refresh'))
    fireEvent.click(screen.getByText('Confirm'))
    await waitFor(() => expect(refreshMock.result).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByText('Undo'))

    expect(
      await screen.findByText('The request was refused')
    ).toBeInTheDocument()
  })

  it('restores the previous title and description on undo and refreshes again on redo', async () => {
    renderHook(edited)
    await screen.findByText('Refresh')

    fireEvent.click(screen.getByText('Refresh'))
    fireEvent.click(screen.getByText('Confirm'))
    await waitFor(() => expect(refreshMock.result).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByText('Undo'))

    await waitFor(() =>
      expect(screen.getByTestId('Snapshot')).toHaveTextContent(
        'My Outreach title|My own description.'
      )
    )
    await waitFor(() => expect(undoMock.result).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByText('Redo'))

    await waitFor(() =>
      expect(screen.getByTestId('Snapshot')).toHaveTextContent(
        'Outreach in Europe 2026|The journey as it reads now.'
      )
    )
    await waitFor(() => expect(refreshMock.result).toHaveBeenCalledTimes(2))
  })
})
