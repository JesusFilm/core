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

import {
  snapshotEdited,
  useSnapshotRefreshCommand
} from './useSnapshotRefreshCommand'

/** English, reworded by the author since it was linked; the journey itself says something newer. */
const edited: CampaignRegionLanguage = {
  ...eurEnglish,
  title: 'My Christmas title',
  description: 'My own description.',
  journey: {
    ...eurEnglish.journey!,
    title: 'Christmas in Europe 2026',
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
        title: 'Christmas in Europe 2026',
        description: 'The journey as it reads now.'
      }
    }
  }))
}

const undoMock = {
  request: {
    query: CAMPAIGN_REGION_LANGUAGE_UPDATE,
    variables: {
      id: 'eurRegionId-529',
      input: { title: 'My Christmas title', description: 'My own description.' }
    }
  },
  result: vi.fn(() => ({ data: { campaignRegionLanguageUpdate: edited } }))
}

/** Shows the English snapshot the provider sees and drives the hook. */
function Probe(): ReactElement {
  const { campaign } = useCampaignEditor()
  const { requestRefresh, pending, confirmRefresh, cancelRefresh } =
    useSnapshotRefreshCommand()
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

function renderHook(
  english: CampaignRegionLanguage
): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      campaignProp={{
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
      mocks={[refreshMock, undoMock]}
    >
      <CommandProbe />
      <Probe />
    </QueriedEditor>
  )
}

describe('snapshotEdited', () => {
  it('is true only when the snapshot differs from the journey', () => {
    expect(snapshotEdited(eurEnglish)).toBe(false)
    expect(snapshotEdited(edited)).toBe(true)
    expect(snapshotEdited({ ...edited, journey: null })).toBe(false)
  })
})

describe('useSnapshotRefreshCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('refreshes an unedited snapshot at once as a Command, with no confirmation', async () => {
    renderHook(eurEnglish)
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
        'Christmas in Europe 2026|The journey as it reads now.'
      )
    )
    await waitFor(() => expect(refreshMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
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
        'My Christmas title|My own description.'
      )
    )
    await waitFor(() => expect(undoMock.result).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByText('Redo'))

    await waitFor(() =>
      expect(screen.getByTestId('Snapshot')).toHaveTextContent(
        'Christmas in Europe 2026|The journey as it reads now.'
      )
    )
    await waitFor(() => expect(refreshMock.result).toHaveBeenCalledTimes(2))
  })
})
