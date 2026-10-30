import { render, screen } from '@testing-library/react'
import { ReactElement } from 'react'

import { GET_CAMPAIGN_STATS } from '@core/journeys/ui/Campaign'
import { campaignStatsFixture } from '@core/journeys/ui/Campaign/testData'
import { worldAtlas } from '@core/journeys/ui/test/worldAtlas'

import { useCampaignEditor } from '../CampaignEditorProvider'
import { campaign } from '../data'
import { QueriedEditor } from '../testing'

import { AnalyticsEdit } from './AnalyticsEdit'

const statsMock = {
  request: { query: GET_CAMPAIGN_STATS, variables: { id: campaign.id } },
  result: { data: { campaignStats: campaignStatsFixture } }
}

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
      mocks={[statsMock]}
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
      json: () => Promise.resolve(worldAtlas)
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // First: the world map is cached per page load once fetched, and a failure clears it.
  it('says so when the map cannot be loaded, leaving the stats in place', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 })
    renderEdit()
    await screen.findByTestId('CampaignAnalyticsStats')
    expect(
      await screen.findByText('The map could not be loaded. Try again later.')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('WorldMap')).not.toBeInTheDocument()
  })

  it('shows the map under the stats while showMap is on, with no switch on the canvas', async () => {
    renderEdit()
    await screen.findByTestId('CampaignAnalyticsStats')
    expect(
      await screen.findByTestId('WorldMap', undefined, { timeout: 3000 })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('switch', { name: 'Show map' })
    ).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/countries-110m\.json$/)
    )
  })

  it('shows neither the map nor a request for it while showMap is off', async () => {
    renderEdit(false)
    await screen.findByTestId('CampaignAnalyticsStats')
    expect(screen.queryByTestId('WorldMap')).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([[true], [false]])(
    'fills the section width with the map %s, as the public page does',
    async (showMap) => {
      renderEdit(showMap)
      await screen.findByTestId('CampaignAnalyticsStats')

      expect(getComputedStyle(screen.getByTestId('AnalyticsEdit')).width).toBe(
        '100%'
      )
    }
  )
})
