import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen, within } from '@testing-library/react'

import {
  CampaignPageKind,
  JourneyStatus
} from '../../../../__generated__/globalTypes'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { transformCampaignBlocks } from '../libs/transformer'
import { campaignPublic, eurRegion, regionPageBlocks } from '../testData'
import type { CampaignPublic, CampaignRegion, CampaignTreeOf } from '../types'

import {
  CampaignRegionShare,
  CampaignShareLanguage,
  defaultShareLanguage,
  shareLanguages
} from './CampaignRegionShare'

const theme = createCampaignTheme(campaignPublic.theme, false)

function language(
  id: string,
  languageId: string,
  order: number,
  autonym: string,
  journeyStatus: JourneyStatus | null = JourneyStatus.published
): CampaignShareLanguage {
  return {
    __typename: 'CampaignRegionLanguagePublic',
    id,
    languageId,
    order,
    journeyStatus,
    shortLinkUrl:
      journeyStatus === JourneyStatus.published
        ? `https://short.nextstep.is/${id}`
        : null,
    journeyUrl:
      journeyStatus === JourneyStatus.published
        ? `https://your.nextstep.is/${id}`
        : null,
    embedUrl:
      journeyStatus === JourneyStatus.published
        ? `https://your.nextstep.is/embed/${id}`
        : null,
    language: {
      __typename: 'Language',
      id: languageId,
      bcp47: autonym.toLowerCase().slice(0, 2),
      name: [{ __typename: 'LanguageName', value: autonym, primary: true }]
    }
  }
}

/** French first, English second, Spanish drafted, German unlinked, Arabic deleted. */
const languages: CampaignShareLanguage[] = [
  language('eur-en', '529', 1, 'English'),
  language('eur-fr', '496', 0, 'Français'),
  language('eur-es', '21028', 2, 'Español', JourneyStatus.draft),
  language('eur-de', '1106', 3, 'Deutsch', null),
  language('eur-ar', '22658', 4, 'العربية', JourneyStatus.deleted)
]

const region: CampaignRegion = { ...eurRegion, languages }

function shareTree(
  overrides: Partial<CampaignTreeOf<'CampaignRegionShareBlock'>> = {}
): CampaignTreeOf<'CampaignRegionShareBlock'> {
  const share = regionPageBlocks.find((block) => block.id === 'regionShareId')
  if (share == null || share.__typename !== 'CampaignRegionShareBlock')
    throw new Error('fixture')
  return transformCampaignBlocks([{ ...share, ...overrides }])[0]
}

function renderShare(
  regionProp: CampaignRegion | null = region,
  campaign: CampaignPublic = campaignPublic
) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider
        value={{
          campaign,
          pageKind: CampaignPageKind.regionTemplate,
          region: regionProp
        }}
      >
        <CampaignRegionShare block={shareTree()} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

describe('CampaignRegionShare', () => {
  describe('shareLanguages', () => {
    it('lists only languages with a live-published journey, in region language order', () => {
      expect(shareLanguages(region).map((l) => l.id)).toEqual([
        'eur-fr',
        'eur-en'
      ])
    })
  })

  describe('defaultShareLanguage', () => {
    it("pre-selects the visitor's page language when the region has a journey in it, else the region's first", () => {
      const offered = shareLanguages(region)
      expect(defaultShareLanguage(offered, '529')?.id).toBe('eur-en')
      expect(defaultShareLanguage(offered, '21028')?.id).toBe('eur-fr')
      expect(defaultShareLanguage([], '529')).toBeUndefined()
    })
  })

  it('renders the title, the intro, the step one string and the selector of live languages', () => {
    renderShare()

    expect(
      screen.getByRole('heading', { level: 2, name: 'Share this journey' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('CampaignRegionShareIntro')).toHaveTextContent(
      'Pick a language, preview it, and share the link or QR code.'
    )
    const select = screen.getByRole('combobox', {
      name: 'Pick a language your friend understands.'
    })
    expect(select).toHaveTextContent('English')

    fireEvent.mouseDown(select)
    const options = within(screen.getByRole('listbox')).getAllByRole('option')
    expect(options.map((option) => option.textContent)).toEqual([
      'Français',
      'English'
    ])
    expect(options[0]).toHaveAttribute('lang', 'fr')
  })

  it("falls back to the region's first language when the page language has no journey", () => {
    renderShare(region, { ...campaignPublic, languageId: '21028' })

    expect(screen.getByRole('combobox')).toHaveTextContent('Français')
  })

  it('switches the selected language', () => {
    renderShare()

    fireEvent.mouseDown(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: 'Français' }))

    expect(screen.getByRole('combobox')).toHaveTextContent('Français')
  })

  it('renders title and intro only when no language has a live-published journey', () => {
    renderShare({
      ...region,
      languages: languages.filter(
        (l) => l.journeyStatus !== JourneyStatus.published
      )
    })

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(screen.getByTestId('CampaignRegionShareIntro')).toBeInTheDocument()
    expect(
      screen.queryByTestId('CampaignRegionShareLanguages')
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('renders title and intro only without a region', () => {
    renderShare(null)

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })
})
