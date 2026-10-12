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

const theme = createCampaignTheme(campaignPublic.theme, false)

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
}

async function renderAnalytics({
  mocks = [statsMock()],
  pageKind = CampaignPageKind.landing,
  region = null,
  campaign = campaignPublic,
  language = 'en'
}: RenderOptions = {}): Promise<ReturnType<typeof render>> {
  const i18n = await translations(language)
  const view = (): ReactElement => (
    <I18nContext.Provider value={{ i18n }}>
      <MockedProvider mocks={mocks as never}>
        <ThemeProvider theme={theme}>
          <CampaignProvider value={{ campaign, pageKind, region }}>
            <CampaignAnalytics block={analyticsBlock(pageKind)} />
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

describe('CampaignAnalytics', () => {
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

    it('prints "since" from the first publish date', async () => {
      await renderAnalytics()
      expect(await screen.findByText('since Oct 5')).toBeInTheDocument()
    })

    it('adds the year to "since" when it is not the current one', async () => {
      await renderAnalytics({
        mocks: [
          statsMock({
            ...campaignStatsFixture,
            from: '2020-11-01T00:00:00.000Z'
          })
        ]
      })
      expect(await screen.findByText('since Nov 1, 2020')).toBeInTheDocument()
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
    it('lists only the top 10 countries, each bar relative to the first row', async () => {
      await renderAnalytics({ mocks: [statsMock(withCountries(12))] })
      const list = await screen.findByTestId('CampaignAnalyticsList')
      const rows = Array.from(list.children)
      expect(rows).toHaveLength(10)
      expect(rows[0]).toHaveAttribute('data-testid', 'CampaignAnalyticsRow-AZ')
      expect(rows[9]).toHaveAttribute('data-testid', 'CampaignAnalyticsRow-JZ')
      const widths = rows.map(
        (row) =>
          (
            row.querySelector(
              '[data-testid="CampaignAnalyticsBar"]'
            ) as HTMLElement
          ).style.width ||
          getComputedStyle(
            row.querySelector('[data-testid="CampaignAnalyticsBar"]') as Element
          ).width
      )
      expect(widths[0]).toBe('100%')
      expect(widths[1]).toBe('90%')
      expect(widths[9]).toBe('10%')
    })

    it('still lists codes with no map shape: microstates, XK and A1', async () => {
      await renderAnalytics()
      await screen.findByTestId('CampaignAnalyticsList')
      expect(screen.getByTestId('CampaignAnalyticsRow-XK')).toBeInTheDocument()
      const unknown = screen.getByTestId('CampaignAnalyticsRow-A1')
      expect(unknown).toHaveTextContent('A1')
      expect(unknown).toHaveTextContent('3')
    })

    it('labels countries with Intl.DisplayNames in the viewer locale', async () => {
      await renderAnalytics({ language: 'es' })
      const list = await screen.findByTestId('CampaignAnalyticsList')
      expect(list).toHaveTextContent('Francia')
      expect(list).toHaveTextContent('Nigeria')
      expect(list).not.toHaveTextContent('France')
    })

    it('moves a row between ranks by transform when the tab changes, keeping the same element', async () => {
      await renderAnalytics()
      const list = await screen.findByTestId('CampaignAnalyticsList')
      const nigeria = screen.getByTestId('CampaignAnalyticsRow-NG')
      expect(nigeria).toHaveAttribute('data-rank', '1')
      expect(nigeria).toHaveStyle({ transform: 'translateY(40px)' })

      fireEvent.click(screen.getByRole('tab', { name: 'Africa' }))
      const africaNigeria = screen.getByTestId('CampaignAnalyticsRow-NG')
      expect(africaNigeria).toBe(nigeria)
      expect(africaNigeria).toHaveAttribute('data-rank', '0')
      expect(africaNigeria).toHaveStyle({ transform: 'translateY(0px)' })
      expect(list.children).toHaveLength(2)
    })
  })

  describe('tabs', () => {
    it('on the landing page lists ALL first, then every listed region', async () => {
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
        'All regions',
        'Europe',
        'Africa'
      ])
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
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
  })

  it('requests the stats once for the campaign', async () => {
    const mock = statsMock()
    await renderAnalytics({ mocks: [mock] })
    await screen.findByTestId('CampaignAnalyticsVisitors')
    expect(mock.result).toHaveBeenCalledTimes(1)
  })
})
