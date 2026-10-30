import { useTheme } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type { NextSeoProps } from 'next-seo'
import { ReactElement, ReactNode } from 'react'

import { campaignPublic, eurRegion } from '@core/journeys/ui/Campaign/testData'
import type { CampaignPublic } from '@core/journeys/ui/Campaign/types'
import { googleFontsHref } from '@core/journeys/ui/fonts/googleFontsHref'

import { CampaignPageKind } from '../../../__generated__/globalTypes'

import { CampaignPageWrapper } from './CampaignPageWrapper'

const plausibleProps: Array<Record<string, unknown>> = []
vi.mock('next-plausible', () => ({
  default: ({
    children,
    ...props
  }: {
    children: ReactNode
  } & Record<string, unknown>) => {
    plausibleProps.push(props)
    return <>{children}</>
  }
}))

vi.mock('next/head', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>
}))

const seoCalls: NextSeoProps[] = []
vi.mock('next-seo', () => ({
  NextSeo: (props: NextSeoProps) => {
    seoCalls.push(props)
    return null
  }
}))

function ThemeProbe(): ReactElement {
  return <p data-testid="ThemeDirection">{useTheme().direction}</p>
}

vi.mock('@core/journeys/ui/Campaign', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  CampaignPage: () => <ThemeProbe />
}))

vi.mock('../CampaignLanguageRedirect', () => ({
  CampaignLanguageRedirect: () => null
}))

const arabic: CampaignPublic = {
  ...campaignPublic,
  languageId: '22658',
  language: { __typename: 'Language', id: '22658', bcp47: 'ar' }
}

describe('CampaignPageWrapper', () => {
  beforeEach(() => {
    plausibleProps.length = 0
    seoCalls.length = 0
  })

  it('lays the theme out left to right for a left-to-right Page Language', () => {
    render(
      <CampaignPageWrapper
        campaign={campaignPublic}
        pageKind={CampaignPageKind.landing}
      />
    )

    expect(screen.getByTestId('ThemeDirection')).toHaveTextContent('ltr')
  })

  it('lays the theme out right to left for a right-to-left Page Language', () => {
    render(
      <CampaignPageWrapper
        campaign={arabic}
        pageKind={CampaignPageKind.landing}
      />
    )

    expect(screen.getByTestId('ThemeDirection')).toHaveTextContent('rtl')
  })

  it('links the Google Fonts stylesheet of the campaign theme', () => {
    render(
      <CampaignPageWrapper
        campaign={campaignPublic}
        pageKind={CampaignPageKind.landing}
      />
    )

    expect(document.querySelector('link[rel="stylesheet"]')).toHaveAttribute(
      'href',
      googleFontsHref(campaignPublic.theme)
    )
  })

  it('renders the SEO tags of the page it wraps', () => {
    render(
      <CampaignPageWrapper
        campaign={campaignPublic}
        pageKind={CampaignPageKind.regionTemplate}
        region={eurRegion}
      />
    )

    expect(seoCalls).toHaveLength(1)
    expect(seoCalls[0].canonical).toBe(
      `https://your.nextstep.is/campaign/${campaignPublic.slug}/${eurRegion.slug}`
    )
  })

  it('reports page views to the Plausible site of the campaign team', () => {
    render(
      <CampaignPageWrapper
        campaign={campaignPublic}
        pageKind={CampaignPageKind.landing}
      />
    )

    expect(plausibleProps[0]).toEqual(
      expect.objectContaining({
        domain: `api-journeys-team-${campaignPublic.teamId}`,
        customDomain: '/plausible',
        enabled: true
      })
    )
  })
})
