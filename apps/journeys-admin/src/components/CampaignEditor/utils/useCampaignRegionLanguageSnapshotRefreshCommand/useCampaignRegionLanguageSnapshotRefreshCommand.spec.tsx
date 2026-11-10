import { MockLink } from '@apollo/client/testing'
import Button from '@mui/material/Button'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_regions_languages as CampaignRegionLanguage } from '../../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import { CAMPAIGN_REGION_LANGUAGE_SNAPSHOT_REFRESH } from '../../../../libs/useCampaignRegionLanguageSnapshotRefreshMutation'
import { CAMPAIGN_REGION_LANGUAGE_UPDATE } from '../../../../libs/useCampaignRegionLanguageUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaignWithRegions, eurEnglish } from '../../data'
import { blockOf, blockUpdateMock } from '../../styleTesting'
import { CommandProbe, QueriedEditor } from '../../testing'
import { useCampaignBlockFieldsCommand } from '../useCampaignBlockFieldsCommand'

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
  const { addFields } = useCampaignBlockFieldsCommand()
  const { campaign } = useCampaignEditor()
  const { requestRefresh, pending, confirmRefresh, cancelRefresh } =
    useCampaignRegionLanguageSnapshotRefreshCommand()
  const { undo, redo } = useCommand()
  const english = campaign.regions[0].languages[0]
  return (
    <>
      <Button
        onClick={() =>
          addFields(blockOf<'CampaignHeroBlock'>('heroId'), { minHeight: 70 })
        }
      >
        Slow unrelated edit
      </Button>
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

  it('captures each queued refresh snapshot at execution and retains it through replay', async () => {
    const slow = {
      ...blockUpdateMock(blockOf<'CampaignHeroBlock'>('heroId'), {
        minHeight: 70
      }),
      delay: 500
    }
    const refreshed = {
      title: edited.journey!.title,
      description: edited.journey!.description,
      snapshotEdited: false
    }
    const refresh = { ...refreshMock, maxUsageCount: 3 }
    const restoreRefreshed = {
      request: {
        query: CAMPAIGN_REGION_LANGUAGE_UPDATE,
        variables: { id: eurEnglish.id, input: refreshed }
      },
      result: vi.fn(() => ({
        data: { campaignRegionLanguageUpdate: { ...eurEnglish, ...refreshed } }
      })),
      maxUsageCount: 2
    }
    const restoreOriginal = {
      request: {
        query: CAMPAIGN_REGION_LANGUAGE_UPDATE,
        variables: {
          id: eurEnglish.id,
          input: {
            title: eurEnglish.title,
            description: eurEnglish.description,
            snapshotEdited: eurEnglish.snapshotEdited
          }
        }
      },
      result: vi.fn(() => ({
        data: { campaignRegionLanguageUpdate: eurEnglish }
      }))
    }
    renderHook(eurEnglish, [slow, refresh, restoreRefreshed, restoreOriginal])
    fireEvent.click(
      await screen.findByRole('button', { name: 'Slow unrelated edit' })
    )
    fireEvent.click(screen.getByText('Refresh'))
    fireEvent.click(screen.getByText('Refresh'))
    expect(slow.result).not.toHaveBeenCalled()
    expect(refresh.result).not.toHaveBeenCalled()
    await waitFor(() => expect(refresh.result).toHaveBeenCalledTimes(2))

    for (let replay = 1; replay <= 2; replay++) {
      fireEvent.click(screen.getByText('Undo'))
      await waitFor(() =>
        expect(restoreRefreshed.result).toHaveBeenCalledTimes(replay)
      )
      expect(screen.getByTestId('Snapshot')).toHaveTextContent(
        `${refreshed.title}|${refreshed.description}`
      )
      if (replay === 2) break
      fireEvent.click(screen.getByText('Redo'))
      await waitFor(() => expect(refresh.result).toHaveBeenCalledTimes(3))
    }

    fireEvent.click(screen.getByText('Undo'))
    await waitFor(() => expect(restoreOriginal.result).toHaveBeenCalled())
    expect(screen.getByTestId('Snapshot')).toHaveTextContent(
      `${eurEnglish.title}|${eurEnglish.description}`
    )
  })

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

  it('holds an undo pressed while the refresh is in flight until the refresh settles', async () => {
    // The refresh skips the app's mutation queue, so the Command queue is what orders the undo after it.
    renderHook(edited, [
      { ...refreshMock, delay: 200 },
      { ...undoMock, delay: 0 }
    ])
    await screen.findByText('Refresh')

    fireEvent.click(screen.getByText('Refresh'))
    fireEvent.click(screen.getByText('Confirm'))
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    fireEvent.click(screen.getByText('Undo'))

    expect(refreshMock.result).not.toHaveBeenCalled()
    await waitFor(() => expect(undoMock.result).toHaveBeenCalled())
    expect(refreshMock.result.mock.invocationCallOrder[0]).toBeLessThan(
      undoMock.result.mock.invocationCallOrder[0]
    )
  })
})
