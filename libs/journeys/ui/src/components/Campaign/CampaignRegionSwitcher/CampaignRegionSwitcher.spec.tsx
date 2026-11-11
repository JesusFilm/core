import { ThemeProvider } from '@mui/material/styles'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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
  CampaignRegionCountries,
  CampaignRegionSwitcher,
  FALLBACK_FLAG,
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

const { track } = vi.hoisted(() => ({ track: vi.fn() }))

vi.mock('../../../libs/campaignPlausible', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../libs/campaignPlausible')>()),
  useCampaignPlausible: () => track
}))

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

describe('CampaignRegionSwitcher country names', () => {
  type RegionCountry = CampaignRegion['countries'][number]

  function regionCountry(
    countryId: string,
    flagPngSrc: string | null,
    name: string
  ): RegionCountry {
    return {
      __typename: 'CampaignRegionCountry',
      id: `eurCountry-${countryId}`,
      countryId,
      order: 0,
      country: {
        __typename: 'Country',
        id: countryId,
        flagPngSrc,
        name: [{ __typename: 'CountryName', value: name }]
      }
    }
  }

  function renderCountries(
    countries: RegionCountry[],
    showNames: boolean
  ): HTMLElement {
    render(
      <CampaignRegionCountries region={{ countries }} showNames={showNames} />
    )
    return screen.getByTestId('CampaignRegionCountry')
  }

  it.each([
    ['small', '18px'],
    ['medium', '24px']
  ] as const)(
    'keeps %s flags compact with names on or off',
    (size, expected) => {
      const { rerender } = render(
        <CampaignRegionCountries region={eurRegion} size={size} />
      )
      const flag = () => screen.getByTestId('CampaignCountryFlag')
      expect(flag()).toHaveClass('MuiChip-avatar')

      rerender(
        <CampaignRegionCountries
          region={eurRegion}
          size={size}
          showNames={false}
        />
      )
      expect(flag()).toHaveStyle({
        boxSizing: 'border-box',
        width: expected,
        height: expected
      })
    }
  )

  it('shows each country as a flag with its name by default', () => {
    renderSwitcher(switcherTree())

    const chip = within(
      screen.getByTestId('CampaignRegionCard-eurRegionId')
    ).getByTestId('CampaignRegionCountry')
    expect(chip).toHaveTextContent('France')
    expect(chip.querySelector('img')).toHaveAttribute(
      'src',
      'https://flags.example.org/fr.png'
    )
  })

  it.each([
    [CampaignSwitcherVariant.cards],
    [CampaignSwitcherVariant.list],
    [CampaignSwitcherVariant.pills]
  ])(
    'shows each country as its flag alone in %s while the section hides names, named by its tooltip and accessible name',
    async (variant) => {
      renderSwitcher(
        switcherTree({ switcherVariant: variant, showCountryNames: false })
      )

      const card = screen.getByTestId('CampaignRegionCard-eurRegionId')
      const flag = within(card).getByRole('img', { name: 'France' })
      expect(flag).toHaveAttribute('data-testid', 'CampaignRegionCountry')
      expect(flag.querySelector('img')).toHaveAttribute(
        'src',
        'https://flags.example.org/fr.png'
      )
      expect(
        within(card).getByTestId('CampaignRegionCountries')
      ).not.toHaveTextContent('France')
      expect(card).toHaveAccessibleName(expect.stringContaining('France'))

      fireEvent.mouseOver(flag)
      expect(await screen.findByRole('tooltip')).toHaveTextContent('France')
    }
  )

  it('shows all country names while their region link has keyboard focus', async () => {
    const user = userEvent.setup()
    const region = {
      ...eurRegion,
      countries: [
        regionCountry('FR', null, 'France'),
        regionCountry('DE', null, 'Allemagne')
      ]
    }
    renderSwitcher(switcherTree({ showCountryNames: false }), {
      campaign: { ...campaignPublic, regions: [region, afrRegion] }
    })
    const [first, next] = screen.getAllByRole('link')
    const countries = within(first).getByTestId('CampaignRegionCountries')
    expect(countries).not.toHaveTextContent('Allemagne')

    await user.tab()
    expect(first).toHaveFocus()
    expect(within(countries).getByText('France')).toBeVisible()
    expect(within(countries).getByText('Allemagne')).toBeVisible()

    await user.tab()
    expect(next).toHaveFocus()
    expect(countries).not.toHaveTextContent('France')
    expect(
      within(countries).getByRole('img', { name: 'Allemagne' })
    ).toBeVisible()
  })

  it('applies each section its own setting for the same regions', () => {
    render(
      <ThemeProvider theme={theme}>
        <CampaignProvider
          value={{
            campaign: campaignPublic,
            pageKind: CampaignPageKind.landing,
            region: null
          }}
        >
          <CampaignRegionSwitcher block={switcherTree()} />
          <CampaignRegionSwitcher
            block={switcherTree({ showCountryNames: false })}
          />
        </CampaignProvider>
      </ThemeProvider>
    )

    const [named, flagOnly] = screen.getAllByTestId('CampaignRegionCountries')
    expect(named).toHaveAttribute('data-show-names', 'true')
    expect(named).toHaveTextContent('France')
    expect(flagOnly).toHaveAttribute('data-show-names', 'false')
    expect(flagOnly).not.toHaveTextContent('France')
    expect(
      within(flagOnly).getByRole('img', { name: 'France' })
    ).toBeInTheDocument()
  })

  it.each([
    ['null', null],
    ['empty', '']
  ])(
    'shows the fallback flag for a %s flag source, with the name still shown',
    (_label, flagPngSrc) => {
      const chip = renderCountries(
        [regionCountry('FR', flagPngSrc, 'France')],
        true
      )

      expect(chip.querySelector('img')).not.toBeInTheDocument()
      expect(chip).toHaveTextContent(`${FALLBACK_FLAG}France`)
    }
  )

  it('shows the fallback flag for a flag-only country with no flag, keeping its accessible name', () => {
    const flag = renderCountries([regionCountry('FR', null, 'France')], false)

    expect(flag).toHaveAccessibleName('France')
    expect(flag).toHaveTextContent(FALLBACK_FLAG)
    expect(flag).not.toHaveTextContent('France')
  })

  it.each([[true], [false]])(
    'swaps in the fallback flag when the image fails to load (names shown: %s)',
    async (showNames) => {
      const entry = renderCountries(
        [
          regionCountry('FR', 'https://flags.example.org/missing.png', 'France')
        ],
        showNames
      )

      const image = entry.querySelector('img')
      if (image == null) throw new Error('flag image')
      fireEvent.error(image)

      await waitFor(() =>
        expect(entry.querySelector('img')).not.toBeInTheDocument()
      )
      expect(entry).toHaveTextContent(FALLBACK_FLAG)
      expect(within(entry).getByTestId('CampaignCountryFlag')).toHaveAttribute(
        'data-fallback',
        'true'
      )
      if (showNames) expect(entry).toHaveTextContent('France')
      else expect(entry).toHaveAccessibleName('France')
    }
  )
})

describe('CampaignRegionSwitcher events', () => {
  beforeEach(() => {
    track.mockClear()
  })

  it('sends campaignRegionClick with the region clicked', () => {
    renderSwitcher(switcherTree())
    fireEvent.click(screen.getByTestId('CampaignRegionCard-afrRegionId'))
    expect(track).toHaveBeenCalledWith(
      'campaignRegionClick',
      { targetRegion: expect.objectContaining({ slug: 'afr' }) },
      expect.anything()
    )
  })
})
