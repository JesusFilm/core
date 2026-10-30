import { readFileSync } from 'fs'
import { resolve } from 'path'

import { MockedProvider } from '@apollo/client/testing/react'
import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createInstance } from 'i18next'
import { I18nContext } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { transformCampaignBlocks } from '../libs/transformer'
import {
  afrRegion,
  campaignPublic,
  campaignStatsFixture,
  eurRegion,
  landingBlocks,
  regionPageBlocks
} from '../testData'
import type { CampaignPublic, CampaignRegion, CampaignTreeOf } from '../types'

import type { GetCampaignStats_campaignStats as CampaignStats } from './__generated__/GetCampaignStats'
import { CampaignAnalytics } from './CampaignAnalytics'
import { GET_CAMPAIGN_STATS } from './getCampaignStats'
import type { WorldAtlasTopology } from './WorldMap'

const theme = createCampaignTheme(campaignPublic.theme, false)

const atlas = JSON.parse(
  readFileSync(
    resolve(
      __dirname,
      '../../../../../../../apps/journeys/public/countries-110m.json'
    ),
    'utf8'
  )
) as WorldAtlasTopology

function atlasResponse(): Response {
  return { ok: true, json: async () => atlas } as unknown as Response
}

const WORLD_TRANSFORM = 'translate(0.0px, 0.0px) scale(1.000)'

const nigeria = {
  __typename: 'CampaignRegionCountry' as const,
  id: 'afrCountry-NG',
  countryId: 'NG',
  order: 0,
  country: {
    __typename: 'Country' as const,
    id: 'NG',
    flagPngSrc: null,
    name: [{ __typename: 'CountryName' as const, value: 'Nigeria' }]
  }
}

const mappedCampaign: CampaignPublic = {
  ...campaignPublic,
  regions: [eurRegion, { ...afrRegion, countries: [nigeria] }]
}

function analyticsBlock(
  pageKind: CampaignPageKind
): CampaignTreeOf<'CampaignAnalyticsBlock'> {
  const blocks =
    pageKind === CampaignPageKind.landing ? landingBlocks : regionPageBlocks
  const block = transformCampaignBlocks(blocks).find(
    (candidate) => candidate.__typename === 'CampaignAnalyticsBlock'
  )
  if (block == null || block.__typename !== 'CampaignAnalyticsBlock')
    throw new Error('no analytics fixture')
  return block
}

function statsMock(
  stats: CampaignStats = campaignStatsFixture
): Record<string, unknown> {
  return {
    request: {
      query: GET_CAMPAIGN_STATS,
      variables: { id: campaignPublic.id }
    },
    result: vi.fn(() => ({ data: { campaignStats: stats } }))
  }
}

function failingMock(): Record<string, unknown> {
  return {
    request: {
      query: GET_CAMPAIGN_STATS,
      variables: { id: campaignPublic.id }
    },
    error: new Error('Plausible is down')
  }
}

async function translations(
  language: string
): Promise<ReturnType<typeof createInstance>> {
  const instance = createInstance()
  await instance.init({
    lng: language,
    keySeparator: false,
    nsSeparator: false,
    resources: {},
    interpolation: { escapeValue: false }
  })
  return instance
}

interface RenderOptions {
  mocks?: Array<Record<string, unknown>>
  pageKind?: CampaignPageKind
  region?: CampaignRegion | null
  campaign?: CampaignPublic
  language?: string
  showMap?: boolean
}

async function renderAnalytics({
  mocks = [statsMock()],
  pageKind = CampaignPageKind.landing,
  region = null,
  campaign = campaignPublic,
  language = 'en',
  showMap = true
}: RenderOptions = {}): Promise<ReturnType<typeof render>> {
  const i18n = await translations(language)
  const view = (): ReactElement => (
    <I18nContext.Provider value={{ i18n }}>
      <MockedProvider mocks={mocks as never}>
        <ThemeProvider theme={theme}>
          <CampaignProvider value={{ campaign, pageKind, region }}>
            <CampaignAnalytics
              block={{ ...analyticsBlock(pageKind), showMap }}
            />
          </CampaignProvider>
        </ThemeProvider>
      </MockedProvider>
    </I18nContext.Provider>
  )
  return render(view())
}

function withCountries(count: number): CampaignStats {
  const countries = Array.from({ length: count }, (_, index) => ({
    __typename: 'CampaignCountryStat' as const,
    countryCode: String.fromCharCode(65 + index) + 'Z',
    visitors: 100 - index * 10
  }))
  return {
    ...campaignStatsFixture,
    all: {
      ...campaignStatsFixture.all,
      totalVisitors: 1000,
      countries
    }
  }
}

function viewportTransform(): string {
  return screen.getByTestId('WorldMapViewport').style.transform
}

function scaleOf(transform: string): number {
  return Number(/scale\(([\d.]+)\)/.exec(transform)?.[1])
}

describe('CampaignAnalytics', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockImplementation(async () => atlasResponse())
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // First: the map is cached once fetched (a failure is forgotten), so these
  // run while nothing is cached yet.
  describe('world map loading', () => {
    it('falls back to the stacked layout, keeping the stats, when the map cannot be fetched', async () => {
      fetchMock.mockImplementation(async () => ({ ok: false, status: 404 }))
      await renderAnalytics()
      await screen.findByTestId('CampaignAnalyticsVisitors')
      await waitFor(() =>
        expect(screen.getByTestId('CampaignAnalyticsStats')).toHaveAttribute(
          'data-layout',
          'stacked'
        )
      )
      expect(screen.getByTestId('CampaignAnalyticsList')).toBeInTheDocument()
      expect(screen.queryByTestId('WorldMap')).not.toBeInTheDocument()
    })

    it("holds the map layout with an empty box of the map's size while the shapes load", async () => {
      let land: (() => void) | undefined
      fetchMock.mockImplementation(
        async () =>
          await new Promise<Response>((resolve) => {
            land = () => resolve(atlasResponse())
          })
      )
      await renderAnalytics()
      await screen.findByTestId('CampaignAnalyticsVisitors')
      expect(screen.getByTestId('CampaignAnalyticsStats')).toHaveAttribute(
        'data-layout',
        'map'
      )
      expect(screen.getByTestId('WorldMapPlaceholder')).toBeInTheDocument()
      expect(screen.queryByTestId('WorldMap')).not.toBeInTheDocument()

      land?.()
      expect(await screen.findByTestId('WorldMap')).toBeInTheDocument()
      expect(
        screen.queryByTestId('WorldMapPlaceholder')
      ).not.toBeInTheDocument()
      expect(screen.getByTestId('CampaignAnalyticsStats')).toHaveAttribute(
        'data-layout',
        'map'
      )
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledWith('/countries-110m.json')
    })
  })

  describe('states', () => {
    it('renders the eyebrow, title and skeleton tiles and rows at once, before the stats arrive', async () => {
      await renderAnalytics()
      expect(screen.getByTestId('CampaignEyebrow')).toHaveTextContent(
        'Around the world'
      )
      expect(screen.getByTestId('CampaignTitle')).toHaveTextContent(
        'Where the story is spreading'
      )
      expect(screen.getByTestId('CampaignAnalyticsSkeleton')).toHaveAttribute(
        'aria-busy',
        'true'
      )
      await waitFor(() =>
        expect(
          screen.queryByTestId('CampaignAnalyticsSkeleton')
        ).not.toBeInTheDocument()
      )
    })

    it('renders one muted line when the stats fail with nothing cached', async () => {
      await renderAnalytics({ mocks: [failingMock()] })
      expect(
        await screen.findByText('Visitor numbers are temporarily unavailable')
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('CampaignAnalyticsTopCountry')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('CampaignAnalyticsList')
      ).not.toBeInTheDocument()
      expect(screen.getByTestId('CampaignEyebrow')).toBeInTheDocument()
    })

    it('renders "0 visitors" and "No visits yet" for zero data', async () => {
      await renderAnalytics({
        mocks: [
          statsMock({
            ...campaignStatsFixture,
            all: {
              ...campaignStatsFixture.all,
              totalVisitors: 0,
              countries: []
            }
          })
        ]
      })
      expect(await screen.findByText('0 visitors')).toBeInTheDocument()
      expect(screen.getByText('No visits yet')).toBeInTheDocument()
      expect(
        screen.getByTestId('CampaignAnalyticsTopCountry')
      ).toHaveTextContent('—')
    })

    it('captions the total as all time', async () => {
      await renderAnalytics()
      expect(await screen.findByText('all time')).toBeInTheDocument()
    })
  })

  describe('tiles', () => {
    it('shows the Top country and Total visitors tiles on the ALL tab, and no Regions active tile', async () => {
      await renderAnalytics()
      const visitors = await screen.findByTestId('CampaignAnalyticsVisitors')
      expect(visitors).toHaveTextContent('Total visitors')
      expect(visitors).toHaveTextContent('66')
      const top = screen.getByTestId('CampaignAnalyticsTopCountry')
      expect(top).toHaveTextContent('Top country')
      expect(top).toHaveTextContent('France')
      expect(screen.queryByText(/regions active/i)).not.toBeInTheDocument()
    })

    it('reads the tile labels from the Campaign Strings', async () => {
      await renderAnalytics({
        campaign: {
          ...campaignPublic,
          strings: campaignPublic.strings.map((string) =>
            string.key === 'totalVisitors'
              ? { ...string, value: 'Everyone who came' }
              : string
          )
        }
      })
      expect(await screen.findByText('Everyone who came')).toBeInTheDocument()
    })

    it('keeps the line breaks of a multi-line tile label', async () => {
      await renderAnalytics({
        campaign: {
          ...campaignPublic,
          strings: campaignPublic.strings.map((string) =>
            string.key === 'topCountry'
              ? { ...string, value: 'Top\ncountry' }
              : string
          )
        }
      })
      const label = await screen.findByTestId(
        'CampaignAnalyticsTopCountryLabel'
      )
      expect(label.textContent).toBe('Top\ncountry')
      expect(label).toHaveStyle({ whiteSpace: 'pre-line' })
      expect(screen.getByTestId('CampaignAnalyticsVisitorsLabel')).toHaveStyle({
        whiteSpace: 'pre-line'
      })
    })

    it('shows "<Region name> visitors" for a region tab', async () => {
      await renderAnalytics()
      fireEvent.click(await screen.findByRole('tab', { name: 'Europe' }))
      const visitors = screen.getByTestId('CampaignAnalyticsVisitors')
      expect(visitors).toHaveTextContent('Europe visitors')
      expect(visitors).toHaveTextContent('40')
      expect(
        screen.getByTestId('CampaignAnalyticsTopCountry')
      ).toHaveTextContent('France')

      fireEvent.click(screen.getByRole('tab', { name: 'Africa' }))
      expect(screen.getByTestId('CampaignAnalyticsVisitors')).toHaveTextContent(
        'Africa visitors'
      )
      expect(
        screen.getByTestId('CampaignAnalyticsTopCountry')
      ).toHaveTextContent('Nigeria')
    })
  })

  describe('ranked list', () => {
    it('lists only the top 10 countries, numbered by rank with no bars', async () => {
      await renderAnalytics({ mocks: [statsMock(withCountries(12))] })
      const list = await screen.findByTestId('CampaignAnalyticsList')
      const rows = Array.from(list.children)
      expect(rows).toHaveLength(10)
      expect(rows[0]).toHaveAttribute('data-testid', 'CampaignAnalyticsRow-AZ')
      expect(rows[0]).toHaveAttribute('data-rank', '0')
      expect(rows[0]).toHaveTextContent('01')
      expect(rows[9]).toHaveAttribute('data-testid', 'CampaignAnalyticsRow-JZ')
      expect(rows[9]).toHaveTextContent('10')
      expect(
        list.querySelector('[data-testid="CampaignAnalyticsBar"]')
      ).not.toBeInTheDocument()
      expect(list).toHaveAttribute('data-columns', '1')
      expect(screen.getByTestId('CampaignAnalyticsStats')).toHaveAttribute(
        'data-layout',
        'map'
      )
    })

    it('still lists codes with no map shape: microstates, XK and A1', async () => {
      await renderAnalytics()
      await screen.findByTestId('CampaignAnalyticsList')
      expect(screen.getByTestId('CampaignAnalyticsRow-XK')).toBeInTheDocument()
      const unknown = screen.getByTestId('CampaignAnalyticsRow-A1')
      expect(unknown).toHaveTextContent('A1')
      expect(unknown).toHaveTextContent('3')
    })

    it('labels countries and formats numbers in the Page Language, not the UI locale', async () => {
      await renderAnalytics({
        language: 'en',
        mocks: [
          statsMock({
            ...campaignStatsFixture,
            all: { ...campaignStatsFixture.all, totalVisitors: 12345 }
          })
        ],
        campaign: {
          ...campaignPublic,
          language: { __typename: 'Language', id: '496', bcp47: 'de' }
        }
      })
      const list = await screen.findByTestId('CampaignAnalyticsList')
      expect(list).toHaveTextContent('Frankreich')
      expect(list).not.toHaveTextContent('France')
      expect(screen.getByTestId('CampaignAnalyticsVisitors')).toHaveTextContent(
        '12.345'
      )
    })

    it('labels countries in the UI locale when the Page Language has no bcp47', async () => {
      await renderAnalytics({
        language: 'es',
        campaign: {
          ...campaignPublic,
          language: { __typename: 'Language', id: '529', bcp47: null }
        }
      })
      const list = await screen.findByTestId('CampaignAnalyticsList')
      expect(list).toHaveTextContent('Francia')
      expect(list).not.toHaveTextContent('France')
    })

    it('moves a row between ranks by transform when the tab changes, keeping the same element', async () => {
      await renderAnalytics()
      const list = await screen.findByTestId('CampaignAnalyticsList')
      const nigeria = screen.getByTestId('CampaignAnalyticsRow-NG')
      expect(nigeria).toHaveAttribute('data-rank', '1')
      expect(nigeria).toHaveStyle({ transform: 'translateY(42px)' })

      fireEvent.click(screen.getByRole('tab', { name: 'Africa' }))
      const africaNigeria = screen.getByTestId('CampaignAnalyticsRow-NG')
      expect(africaNigeria).toBe(nigeria)
      expect(africaNigeria).toHaveAttribute('data-rank', '0')
      expect(africaNigeria).toHaveStyle({ transform: 'translateY(0px)' })
      expect(list.children).toHaveLength(2)
    })
  })

  describe('tabs', () => {
    it('on the landing page lists every listed region, then ALL', async () => {
      await renderAnalytics({
        campaign: {
          ...campaignPublic,
          regions: [
            afrRegion,
            { ...eurRegion, order: 0 },
            { ...afrRegion, id: 'orphanId', name: 'Orphan', listed: false }
          ]
        }
      })
      const tabs = await screen.findAllByRole('tab')
      expect(tabs.map((tab) => tab.textContent)).toEqual([
        'Europe',
        'Africa',
        'All regions'
      ])
      expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
    })

    it('on a region page is fixed to the region with no tabs', async () => {
      await renderAnalytics({
        pageKind: CampaignPageKind.regionTemplate,
        region: afrRegion
      })
      const visitors = await screen.findByTestId('CampaignAnalyticsVisitors')
      expect(visitors).toHaveTextContent('Africa visitors')
      expect(visitors).toHaveTextContent('25')
      expect(screen.queryByRole('tab')).not.toBeInTheDocument()
      expect(
        screen.getByTestId('CampaignAnalyticsTopCountry')
      ).toHaveTextContent('Nigeria')
    })

    it('has no tabs when no region is listed', async () => {
      await renderAnalytics({
        campaign: {
          ...campaignPublic,
          regions: campaignPublic.regions.map((region) => ({
            ...region,
            listed: false
          }))
        }
      })
      await screen.findByTestId('CampaignAnalyticsVisitors')
      expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    })

    it('labels and names each tab by the region name, keeps the full name in its tooltip and controls one tabpanel', async () => {
      await renderAnalytics()
      const tabs = await screen.findAllByRole('tab')
      expect(tabs[0]).toHaveTextContent('Europe')
      expect(tabs[0]).toHaveAccessibleName('Europe')
      expect(tabs[0]).toHaveAttribute('title', 'Europe')
      expect(tabs[1]).toHaveAccessibleName('Africa')
      const panel = screen.getByRole('tabpanel')
      tabs.forEach((tab) =>
        expect(tab).toHaveAttribute('aria-controls', panel.id)
      )
      expect(panel).toHaveAttribute('aria-labelledby', tabs[2].id)
      fireEvent.click(tabs[1])
      expect(panel).toHaveAttribute('aria-labelledby', tabs[1].id)
    })

    it('cuts a long region name with an ellipsis on one line', async () => {
      await renderAnalytics()
      const [europe] = await screen.findAllByRole('tab')
      const label = europe.firstElementChild as HTMLElement
      expect(label).toHaveTextContent('Europe')
      expect(label).toHaveStyle({
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      })
    })

    it('points aria-controls at a mounted, busy panel while the stats load, in both layouts', async () => {
      for (const showMap of [true, false]) {
        const { unmount } = await renderAnalytics({ showMap })
        const tabs = screen.getAllByRole('tab')
        const panel = document.getElementById(
          tabs[0].getAttribute('aria-controls') ?? ''
        )
        expect(panel).not.toBeNull()
        expect(panel).toHaveAttribute('role', 'tabpanel')
        expect(panel).toHaveAttribute('aria-busy', 'true')
        await waitFor(() =>
          expect(screen.getByRole('tabpanel')).not.toHaveAttribute('aria-busy')
        )
        unmount()
      }
    })

    it('puts only the selected tab in the tab order', async () => {
      await renderAnalytics()
      const tabs = await screen.findAllByRole('tab')
      expect(tabs.map((tab) => tab.getAttribute('tabindex'))).toEqual([
        '-1',
        '-1',
        '0'
      ])
    })

    it('moves selection and focus with the arrow keys, wrapping, and with Home and End', async () => {
      await renderAnalytics()
      const tabs = await screen.findAllByRole('tab')
      tabs[2].focus()

      fireEvent.keyDown(tabs[2], { key: 'ArrowRight' })
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[0]).toHaveFocus()
      expect(tabs[0]).toHaveAttribute('tabindex', '0')

      fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' })
      expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[2]).toHaveFocus()

      fireEvent.keyDown(tabs[2], { key: 'Home' })
      expect(tabs[0]).toHaveFocus()
      fireEvent.keyDown(tabs[0], { key: 'End' })
      expect(tabs[2]).toHaveFocus()
      expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('requests the stats once for the campaign', async () => {
    const mock = statsMock()
    await renderAnalytics({ mocks: [mock] })
    await screen.findByTestId('CampaignAnalyticsVisitors')
    expect(mock.result).toHaveBeenCalledTimes(1)
  })

  describe('world map', () => {
    it('renders the map only when showMap is true', async () => {
      const { unmount } = await renderAnalytics()
      await screen.findByTestId('CampaignAnalyticsStats')
      expect(screen.getByTestId('WorldMap')).toBeInTheDocument()
      unmount()

      await renderAnalytics({ showMap: false })
      await screen.findByTestId('CampaignAnalyticsStats')
      expect(screen.queryByTestId('WorldMap')).not.toBeInTheDocument()
    })

    it('letterboxes the map so no edge is cropped', async () => {
      await renderAnalytics()
      expect(await screen.findByTestId('WorldMap')).toHaveAttribute(
        'preserveAspectRatio',
        'xMidYMid meet'
      )
    })

    it('draws the outline at once in the loading state, with no countries coloured', async () => {
      await renderAnalytics({ campaign: mappedCampaign })
      expect(
        screen.getByTestId('CampaignAnalyticsSkeleton')
      ).toBeInTheDocument()
      expect(screen.getByTestId('WorldMap')).toBeInTheDocument()
      expect(screen.getAllByTestId(/^WorldMapCountry-/).length).toBeGreaterThan(
        100
      )
      expect(
        document.querySelector('[data-testid^="WorldMapCountry-"][data-step]')
      ).toBeNull()
      await waitFor(() =>
        expect(
          screen.queryByTestId('CampaignAnalyticsSkeleton')
        ).not.toBeInTheDocument()
      )
    })

    it('does not draw the map when the stats are unavailable', async () => {
      await renderAnalytics({ mocks: [failingMock()] })
      await screen.findByText('Visitor numbers are temporarily unavailable')
      expect(screen.queryByTestId('WorldMap')).not.toBeInTheDocument()
    })

    it("colours the union of all regions' countries on ALL, and no other country", async () => {
      await renderAnalytics({ campaign: mappedCampaign })
      await screen.findByTestId('CampaignAnalyticsStats')
      expect(screen.getByTestId('WorldMapCountry-250')).toHaveAttribute(
        'data-step',
        '3'
      )
      expect(screen.getByTestId('WorldMapCountry-566')).toHaveAttribute(
        'data-step'
      )
      expect(screen.getByTestId('WorldMapCountry-840')).not.toHaveAttribute(
        'data-step'
      )
      expect(viewportTransform()).toBe(WORLD_TRANSFORM)
    })

    it("colours and zooms to the selected region's countries on its tab", async () => {
      await renderAnalytics({ campaign: mappedCampaign })
      fireEvent.click(await screen.findByRole('tab', { name: 'Europe' }))
      expect(screen.getByTestId('WorldMapCountry-250')).toHaveAttribute(
        'data-step',
        '3'
      )
      expect(screen.getByTestId('WorldMapCountry-566')).not.toHaveAttribute(
        'data-step'
      )
      const europe = viewportTransform()
      expect(europe).not.toBe(WORLD_TRANSFORM)
      expect(scaleOf(europe)).toBeGreaterThan(1)

      fireEvent.click(screen.getByRole('tab', { name: 'Africa' }))
      expect(screen.getByTestId('WorldMapCountry-566')).toHaveAttribute(
        'data-step'
      )
      expect(screen.getByTestId('WorldMapCountry-250')).not.toHaveAttribute(
        'data-step'
      )
      expect(viewportTransform()).not.toBe(europe)

      fireEvent.click(screen.getByRole('tab', { name: 'All regions' }))
      expect(viewportTransform()).toBe(WORLD_TRANSFORM)
    })

    it('shows the world for a region with no countries', async () => {
      await renderAnalytics()
      fireEvent.click(await screen.findByRole('tab', { name: 'Africa' }))
      expect(viewportTransform()).toBe(WORLD_TRANSFORM)
    })

    it('zooms a Region Page to its own region', async () => {
      await renderAnalytics({
        campaign: mappedCampaign,
        pageKind: CampaignPageKind.regionTemplate,
        region: mappedCampaign.regions[0]
      })
      await screen.findByTestId('CampaignAnalyticsStats')
      expect(scaleOf(viewportTransform())).toBeGreaterThan(1)
      expect(screen.getByTestId('WorldMapCountry-566')).not.toHaveAttribute(
        'data-step'
      )
    })
  })
})
