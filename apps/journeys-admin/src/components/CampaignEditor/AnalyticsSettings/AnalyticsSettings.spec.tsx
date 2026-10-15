import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement, useState } from 'react'

import {
  GetCampaign_campaign_blocks_CampaignAnalyticsBlock as AnalyticsBlock,
  GetCampaign_campaign as Campaign
} from '../../../../__generated__/GetCampaign'
import { CAMPAIGN_ANALYTICS_BLOCK_UPDATE_SHOW_MAP } from '../../../libs/useCampaignAnalyticsBlockShowMapMutation'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { campaign } from '../data'
import { CommandProbe, SelectionProbe, StaticEditor } from '../testing'

import { AnalyticsSettings } from './AnalyticsSettings'

function showMapMock(showMap: boolean): Record<string, unknown> {
  return {
    request: {
      query: CAMPAIGN_ANALYTICS_BLOCK_UPDATE_SHOW_MAP,
      variables: { id: 'landingAnalyticsId', input: { showMap } }
    },
    result: vi.fn(() => ({
      data: {
        campaignAnalyticsBlockUpdate: {
          __typename: 'CampaignAnalyticsBlock',
          id: 'landingAnalyticsId',
          showMap
        }
      }
    }))
  }
}

const turnOffMock = showMapMock(false)
const turnOnMock = showMapMock(true)

/** The panel with a way to unmount it, as selecting another block does. */
function RemovablePanel({ block }: { block: AnalyticsBlock }): ReactElement {
  const [mounted, setMounted] = useState(true)
  return (
    <>
      <button onClick={() => setMounted(false)}>Unmount panel</button>
      {mounted && <AnalyticsSettings block={block} />}
    </>
  )
}

function renderSettings(
  showMap = true,
  mocks: Array<Record<string, unknown>> = [turnOffMock, turnOnMock]
): ReturnType<typeof render> {
  const campaignProp: Campaign = {
    ...campaign,
    blocks: campaign.blocks.map((block) =>
      block.id === 'landingAnalyticsId' &&
      block.__typename === 'CampaignAnalyticsBlock'
        ? { ...block, showMap }
        : block
    )
  }
  const block = campaignProp.blocks.find(
    (candidate) => candidate.id === 'landingAnalyticsId'
  )
  if (block?.__typename !== 'CampaignAnalyticsBlock')
    throw new Error('the fixture has no analytics block')
  return render(
    <StaticEditor campaignProp={campaignProp} mocks={mocks}>
      <CommandUndoItem variant="button" />
      <CommandProbe />
      <SelectionProbe />
      <RemovablePanel block={block} />
    </StaticEditor>
  )
}

describe('AnalyticsSettings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the Show map switch as the section holds it', () => {
    const { unmount } = renderSettings()
    expect(screen.getByRole('switch', { name: 'Show map' })).toBeChecked()

    unmount()
    renderSettings(false)
    expect(screen.getByRole('switch', { name: 'Show map' })).not.toBeChecked()
  })

  it('turns the map off as one Command through campaignAnalyticsBlockUpdate, and undoes it', async () => {
    renderSettings()
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')

    fireEvent.click(screen.getByRole('switch', { name: 'Show map' }))

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(turnOffMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(turnOnMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'landingAnalyticsId'
    )
  })

  it('shows the API message when the write is refused', async () => {
    renderSettings(true, [
      {
        request: turnOffMock.request,
        result: { errors: [{ message: 'The request was refused' }] }
      }
    ])

    fireEvent.click(screen.getByRole('switch', { name: 'Show map' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The request was refused'
    )
  })

  it('raises a refused undo in the error snackbar after the panel has unmounted', async () => {
    renderSettings(true, [
      turnOffMock,
      {
        request: turnOnMock.request,
        result: { errors: [{ message: 'The undo was refused' }] }
      }
    ])
    fireEvent.click(screen.getByRole('switch', { name: 'Show map' }))
    await waitFor(() => expect(turnOffMock.result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Unmount panel' }))

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(await screen.findByText('The undo was refused')).toBeInTheDocument()
  })

  it('turns the map on from off', async () => {
    renderSettings(false)

    fireEvent.click(screen.getByRole('switch', { name: 'Show map' }))

    await waitFor(() => expect(turnOnMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })
})
