import { readFileSync } from 'fs'
import { resolve } from 'path'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { GET_CAMPAIGN_STATS } from '@core/journeys/ui/Campaign'
import { campaignStatsFixture } from '@core/journeys/ui/Campaign/testData'

import { CAMPAIGN_ANALYTICS_BLOCK_UPDATE_SHOW_MAP } from '../../../libs/useCampaignAnalyticsBlockShowMapMutation'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { campaign } from '../data'
import { CommandProbe, QueriedEditor, SelectionProbe } from '../testing'

import { AnalyticsEdit } from './AnalyticsEdit'

const atlas = readFileSync(
  resolve(
    __dirname,
    '../../../../../../apps/journeys/public/countries-110m.json'
  ),
  'utf8'
)

const statsMock = {
  request: { query: GET_CAMPAIGN_STATS, variables: { id: campaign.id } },
  result: { data: { campaignStats: campaignStatsFixture } }
}

function showMapMock(showMap: boolean): Record<string, unknown> {
  return {
    delay: 1000,
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

function Harness(): ReactElement | null {
  const { campaign: current } = useCampaignEditor()
  const block = current.blocks.find(
    (candidate) => candidate.id === 'landingAnalyticsId'
  )
  if (block?.__typename !== 'CampaignAnalyticsBlock') return null
  return <AnalyticsEdit block={block} />
}

function renderEdit(showMap = true): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      mocks={[statsMock, turnOffMock, turnOnMock]}
      campaignProp={{
        ...campaign,
        blocks: campaign.blocks.map((block) =>
          block.id === 'landingAnalyticsId' &&
          block.__typename === 'CampaignAnalyticsBlock'
            ? { ...block, showMap }
            : block
        )
      }}
    >
      <CommandUndoItem variant="button" />
      <CommandProbe />
      <SelectionProbe />
      <Harness />
    </QueriedEditor>
  )
}

describe('AnalyticsEdit', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(JSON.parse(atlas))
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the Show map switch on, with the map under the stats', async () => {
    renderEdit()
    expect(
      await screen.findByRole('switch', { name: 'Show map' })
    ).toBeChecked()
    expect(await screen.findByTestId('WorldMap')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/countries-110m\.json$/)
    )
  })

  it('shows neither the map nor a request for it while showMap is off', async () => {
    renderEdit(false)
    expect(
      await screen.findByRole('switch', { name: 'Show map' })
    ).not.toBeChecked()
    await screen.findByTestId('CampaignAnalyticsStats')
    expect(screen.queryByTestId('WorldMap')).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('turns the map off as one Command through campaignAnalyticsBlockUpdate, and undoes it', async () => {
    renderEdit()
    const toggle = await screen.findByRole('switch', { name: 'Show map' })
    await screen.findByTestId('WorldMap')
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')

    fireEvent.click(toggle)

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'landingAnalyticsId'
    )
    // Optimistic: the map is gone before the request returns.
    await waitFor(() =>
      expect(screen.queryByTestId('WorldMap')).not.toBeInTheDocument()
    )
    expect(screen.getByRole('switch', { name: 'Show map' })).not.toBeChecked()
    expect(turnOffMock.result).not.toHaveBeenCalled()
    await waitFor(() => expect(turnOffMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(await screen.findByTestId('WorldMap')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Show map' })).toBeChecked()
    await waitFor(() => expect(turnOnMock.result).toHaveBeenCalled())
  })

  it('turns the map on from off', async () => {
    renderEdit(false)
    fireEvent.click(await screen.findByRole('switch', { name: 'Show map' }))
    expect(await screen.findByTestId('WorldMap')).toBeInTheDocument()
    await waitFor(() => expect(turnOnMock.result).toHaveBeenCalled())
  })
})
