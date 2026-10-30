import { ThemeProvider } from '@mui/material/styles'
import { render, screen, within } from '@testing-library/react'

import {
  CampaignPageKind,
  CampaignSwitcherVariant
} from '../../../../__generated__/globalTypes'
import { cssRulesFor } from '../../../test/cssRulesFor'
import { shouldRenderSection } from '../CampaignPage'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { transformCampaignBlocks } from '../libs/transformer'
import {
  afrRegion,
  campaignPublic,
  eurRegion,
  landingBlocks
} from '../testData'
import type {
  CampaignPublic,
  CampaignRegion,
  CampaignSectionTree,
  CampaignTreeOf
} from '../types'

import {
  CampaignRegionSwitcher,
  switcherRegions
} from './CampaignRegionSwitcher'

const theme = createCampaignTheme(campaignPublic.theme, false)

const lacRegion: CampaignRegion = {
  ...afrRegion,
  id: 'lacRegionId',
  slug: 'lac',
  name: 'Latin America',
  order: 2,
  listed: false
}

function switcherTree(
  overrides: Partial<CampaignTreeOf<'CampaignRegionSwitcherBlock'>> = {}
): CampaignTreeOf<'CampaignRegionSwitcherBlock'> {
  const switcher = landingBlocks.find(
    (block) => block.id === 'landingSwitcherId'
  )
  if (switcher == null || switcher.__typename !== 'CampaignRegionSwitcherBlock')
    throw new Error('fixture')
  return transformCampaignBlocks([{ ...switcher, ...overrides }])[0]
}

interface RenderOptions {
  campaign?: CampaignPublic
  region?: CampaignRegion | null
  pageKind?: CampaignPageKind
}

function renderSwitcher(
  block: CampaignTreeOf<'CampaignRegionSwitcherBlock'>,
  {
    campaign = campaignPublic,
    region = null,
    pageKind = CampaignPageKind.landing
  }: RenderOptions = {}
) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider value={{ campaign, pageKind, region }}>
        <CampaignRegionSwitcher block={block} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

describe('CampaignRegionSwitcher', () => {
  const withLac: CampaignPublic = {
    ...campaignPublic,
    regions: [afrRegion, lacRegion, eurRegion]
  }

  it('renders listed regions only, by order, linking each to its region page', () => {
    renderSwitcher(switcherTree(), { campaign: withLac })

    const cards = screen.getAllByRole('link')
    expect(cards.map((card) => card.getAttribute('href'))).toEqual([
      '/campaign/outreach-2026/eur?lang=en',
      '/campaign/outreach-2026/afr?lang=en'
    ])
    expect(
      screen.queryByTestId('CampaignRegionCard-lacRegionId')
    ).not.toBeInTheDocument()
  })

  it('aligns the card text to the reading side', () => {
    renderSwitcher(switcherTree())
    expect(
      cssRulesFor(screen.getByTestId('CampaignRegionCard-eurRegionId'))
    ).toContain('text-align:start')
  })

  it('shows the name as heading with the lines beneath and country chips with flags', () => {
    renderSwitcher(switcherTree())

    const card = screen.getByTestId('CampaignRegionCard-eurRegionId')
    expect(
      within(card).getByTestId('CampaignRegionCardName')
    ).toHaveTextContent('Europe')
    expect(within(card).getByTestId('CampaignTypography')).toHaveTextContent(
      'EUR'
    )
    const chip = within(card).getByTestId('CampaignRegionCountry')
    expect(chip).toHaveTextContent('France')
    expect(chip.querySelector('img')).toHaveAttribute(
      'src',
      'https://flags.example.org/fr.png'
    )
    expect(
      within(
        screen.getByTestId('CampaignRegionCard-afrRegionId')
      ).queryByTestId('CampaignRegionCountries')
    ).not.toBeInTheDocument()
  })

  it('hides the current region on its own page', () => {
    renderSwitcher(switcherTree(), {
      region: eurRegion,
      pageKind: CampaignPageKind.regionTemplate
    })

    expect(
      screen.queryByTestId('CampaignRegionCard-eurRegionId')
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('CampaignRegionCard-afrRegionId')
    ).toBeInTheDocument()
    expect(switcherRegions([eurRegion, afrRegion], eurRegion)).toEqual([
      afrRegion
    ])
  })

  it('renders the section title', () => {
    renderSwitcher(switcherTree({ title: 'Choose your region' }))

    expect(
      screen.getByRole('heading', { level: 2, name: 'Choose your region' })
    ).toBeInTheDocument()
  })

  it.each([
    [CampaignSwitcherVariant.cards],
    [CampaignSwitcherVariant.list],
    [CampaignSwitcherVariant.pills]
  ])('lays the regions out as %s', (variant) => {
    renderSwitcher(switcherTree({ switcherVariant: variant }))

    expect(screen.getByTestId('CampaignRegionSwitcherGrid')).toHaveAttribute(
      'data-variant',
      variant
    )
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })

  it('keeps the region lines at their width in the list variant, so a code never wraps', () => {
    renderSwitcher(
      switcherTree({ switcherVariant: CampaignSwitcherVariant.list })
    )

    const lines = within(
      screen.getByTestId('CampaignRegionCard-eurRegionId')
    ).getByTestId('CampaignRegionLines')
    expect(getComputedStyle(lines).flexShrink).toBe('0')
  })

  it('caps the region lines at half the row from md in the list variant, so a long line wraps and leaves the name and chips their room', () => {
    renderSwitcher(
      switcherTree({ switcherVariant: CampaignSwitcherVariant.list })
    )

    const lines = within(
      screen.getByTestId('CampaignRegionCard-eurRegionId')
    ).getByTestId('CampaignRegionLines')
    const rules = Array.from(document.styleSheets)
      .flatMap((sheet) => Array.from(sheet.cssRules))
      .map((rule) => rule.cssText)
      .filter((cssText) =>
        lines.className.split(' ').some((name) => cssText.includes(name))
      )
      .join(' ')
    expect(rules).toMatch(/max-width:\s*50%/)
  })

  it('keeps pills to the name and flags, without lines', () => {
    renderSwitcher(
      switcherTree({ switcherVariant: CampaignSwitcherVariant.pills })
    )

    const pill = screen.getByTestId('CampaignRegionCard-eurRegionId')
    expect(
      within(pill).getByTestId('CampaignRegionCardName')
    ).toHaveTextContent('Europe')
    expect(
      within(pill).queryByTestId('CampaignTypography')
    ).not.toBeInTheDocument()
    expect(
      within(pill).getByTestId('CampaignRegionCountry')
    ).toBeInTheDocument()
  })

  it('is skipped by the page when no region is listed', () => {
    const section = switcherTree() as CampaignSectionTree
    expect(
      shouldRenderSection(section, {
        pageKind: CampaignPageKind.landing,
        region: null,
        regions: [lacRegion],
        strings: campaignPublic.strings
      })
    ).toBe(false)
    expect(
      shouldRenderSection(section, {
        pageKind: CampaignPageKind.landing,
        region: null,
        regions: [eurRegion],
        strings: campaignPublic.strings
      })
    ).toBe(true)
  })

  it('is skipped on the Region Page of the only listed region, which it would hide', () => {
    const section = switcherTree() as CampaignSectionTree
    expect(
      shouldRenderSection(section, {
        pageKind: CampaignPageKind.regionTemplate,
        region: eurRegion,
        regions: [eurRegion, lacRegion],
        strings: campaignPublic.strings
      })
    ).toBe(false)
    expect(
      shouldRenderSection(section, {
        pageKind: CampaignPageKind.regionTemplate,
        region: eurRegion,
        regions: [eurRegion, afrRegion],
        strings: campaignPublic.strings
      })
    ).toBe(true)
  })

  it('renders with no region to show when it holds an Extra', () => {
    const switcher = landingBlocks.find(
      (block) => block.id === 'landingSwitcherId'
    )
    const button = landingBlocks.find(
      (block) => block.id === 'switcherEuropeButtonId'
    )
    if (switcher == null || button == null) throw new Error('fixture')
    const section = transformCampaignBlocks([
      switcher,
      button
    ])[0] as CampaignSectionTree
    expect(
      shouldRenderSection(section, {
        pageKind: CampaignPageKind.regionTemplate,
        region: eurRegion,
        regions: [eurRegion],
        strings: campaignPublic.strings
      })
    ).toBe(true)
  })
})
