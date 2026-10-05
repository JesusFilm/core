import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen, within } from '@testing-library/react'

import {
  CampaignBackgroundKind,
  CampaignBackgroundOverlay,
  CampaignPageKind
} from '../../../../__generated__/globalTypes'
import { campaignChromeTrees } from '../CampaignPage/campaignChromeTrees'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { resolveBand } from '../libs/resolveBand'
import { campaignPublic, chromeBlocks, eurRegion, headerBlock } from '../testData'
import type { CampaignBlock, CampaignPublic, CampaignRegion } from '../types'

import { CampaignHeader } from './CampaignHeader'

const theme = createCampaignTheme(campaignPublic.theme, false)

const logoBlock = {
  __typename: 'CampaignImageBlock',
  id: 'logoId',
  campaignId: 'campaignId',
  pageId: null,
  regionId: null,
  parentBlockId: 'headerId',
  parentOrder: null,
  src: 'https://images.example.org/logo.png',
  alt: 'Christmas logo',
  width: 320,
  height: 80
} as unknown as CampaignBlock

const coverBlock = {
  __typename: 'CampaignImageBlock',
  id: 'headerCoverId',
  campaignId: 'campaignId',
  pageId: null,
  regionId: null,
  parentBlockId: 'headerId',
  parentOrder: null,
  src: 'https://images.example.org/cover.jpg',
  alt: null,
  width: 1600,
  height: 400
} as unknown as CampaignBlock

function withHeader(
  overrides: Partial<CampaignBlock> = {},
  chrome: CampaignBlock[] = chromeBlocks,
  campaignOverrides: Partial<CampaignPublic> = {}
): CampaignPublic {
  const header = { ...headerBlock, ...overrides } as typeof headerBlock
  return {
    ...campaignPublic,
    ...campaignOverrides,
    header,
    chrome: chrome.map((block) => (block.id === header.id ? header : block))
  }
}

function renderHeader(
  campaign: CampaignPublic = campaignPublic,
  {
    pageKind = CampaignPageKind.landing,
    region = null,
    basePath
  }: { pageKind?: CampaignPageKind; region?: CampaignRegion | null; basePath?: string } = {}
) {
  const { header } = campaignChromeTrees(campaign)
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider value={{ campaign, pageKind, region, basePath }}>
        <CampaignHeader block={header} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

function styleText(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((node) => node.textContent ?? '')
    .join('')
}

function emotionClass(element: Element): string {
  const name = Array.from(element.classList).find((candidate) => candidate.startsWith('css-'))
  if (name == null) throw new Error('no emotion class')
  return name.replace(/[-]/g, '\\-')
}

/** The element's base emotion rule body. */
function baseRule(element: Element): string {
  return styleText().match(new RegExp(`(?:^|\\})\\.${emotionClass(element)}\\{([^}]*)\\}`))?.[1] ?? ''
}

/** The element's emotion rule body under the `min-width` media query. */
function mediaRule(element: Element, minWidth: number): string {
  return (
    styleText().match(
      new RegExp(`@media \\(min-width:${minWidth}px\\)[^{]*\\{\\.${emotionClass(element)}\\{([^}]*)\\}`)
    )?.[1] ?? ''
  )
}

describe('CampaignHeader', () => {
  describe('brand mark', () => {
    it('renders the campaign title as text when no logo is set, linking to the landing page in the page language', () => {
      renderHeader()
      expect(screen.getByTestId('CampaignBrandMarkTitle')).toHaveTextContent('Christmas 2026')
      expect(screen.queryByTestId('CampaignBrandMarkLogo')).not.toBeInTheDocument()
      expect(screen.getByTestId('CampaignBrandMark')).toHaveAttribute(
        'href',
        '/campaign/christmas-2026?lang=en'
      )
    })

    it('renders the logo image when logoBlockId is set', () => {
      renderHeader(withHeader({ logoBlockId: 'logoId' }, [...chromeBlocks, logoBlock]))
      const logo = screen.getByTestId('CampaignBrandMarkLogo')
      expect(logo).toHaveAttribute('src', 'https://images.example.org/logo.png')
      expect(logo).toHaveAttribute('alt', 'Christmas logo')
      expect(screen.queryByTestId('CampaignBrandMarkTitle')).not.toBeInTheDocument()
      expect(screen.getByTestId('CampaignBrandMark')).toHaveAttribute(
        'href',
        '/campaign/christmas-2026?lang=en'
      )
    })

    it('falls back to the title when logoBlockId names no block in the chrome', () => {
      renderHeader(withHeader({ logoBlockId: 'missingId' }))
      expect(screen.getByTestId('CampaignBrandMarkTitle')).toHaveTextContent('Christmas 2026')
    })

    it('omits the lang param on a single-language campaign', () => {
      renderHeader({ ...campaignPublic, languages: [campaignPublic.languages[0]] })
      expect(screen.getByTestId('CampaignBrandMark')).toHaveAttribute(
        'href',
        '/campaign/christmas-2026'
      )
    })

    it('links to the domain root on a Campaign Root', () => {
      renderHeader(campaignPublic, { basePath: '' })
      expect(screen.getByTestId('CampaignBrandMark')).toHaveAttribute('href', '/?lang=en')
    })

    it('links in the current page language, not the default', () => {
      renderHeader({
        ...campaignPublic,
        languageId: '496',
        language: { __typename: 'Language', id: '496', bcp47: 'fr' }
      })
      expect(screen.getByTestId('CampaignBrandMark')).toHaveAttribute(
        'href',
        '/campaign/christmas-2026?lang=fr'
      )
    })
  })

  describe('back chip', () => {
    it('shows the "All regions" chip in the leading slot on a region page, linking to the landing page', () => {
      renderHeader(campaignPublic, {
        pageKind: CampaignPageKind.regionTemplate,
        region: eurRegion
      })
      const chip = screen.getByTestId('CampaignAllRegionsChip')
      expect(within(screen.getByTestId('CampaignHeaderLeading')).getByText('All regions')).toBeInTheDocument()
      expect(chip).toHaveAttribute('href', '/campaign/christmas-2026?lang=en')
    })

    it('leaves the leading slot empty on the landing page', () => {
      renderHeader()
      expect(screen.queryByTestId('CampaignAllRegionsChip')).not.toBeInTheDocument()
      expect(screen.getByTestId('CampaignHeaderLeading')).toBeEmptyDOMElement()
    })
  })

  describe('language select', () => {
    it('renders with two or more campaign languages, labelled by autonym in CampaignLanguage.order', () => {
      renderHeader()
      const select = screen.getByTestId('CampaignLanguageSelect')
      expect(select).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: 'Language' })).toHaveTextContent('English')
      fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Language' }))
      const options = screen.getAllByRole('option').map((option) => option.textContent)
      expect(options).toEqual(['English', 'Français'])
    })

    it('orders the options by CampaignLanguage.order', () => {
      renderHeader({
        ...campaignPublic,
        languages: [
          { ...campaignPublic.languages[0], order: 1 },
          { ...campaignPublic.languages[1], order: 0 }
        ]
      })
      fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Language' }))
      const options = screen.getAllByRole('option').map((option) => option.textContent)
      expect(options).toEqual(['Français', 'English'])
    })

    it('is not rendered with one campaign language', () => {
      renderHeader({ ...campaignPublic, languages: [campaignPublic.languages[0]] })
      expect(screen.queryByTestId('CampaignLanguageSelect')).not.toBeInTheDocument()
    })

    it('reloads the page with the chosen language as the lang param', () => {
      const assign = vi.fn()
      const location = window.location
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...location, href: 'http://localhost/campaign/christmas-2026?lang=en#heroId', assign }
      })
      renderHeader()
      fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Language' }))
      fireEvent.click(screen.getByRole('option', { name: 'Français' }))
      expect(assign).toHaveBeenCalledWith('http://localhost/campaign/christmas-2026?lang=fr')
      Object.defineProperty(window, 'location', { configurable: true, value: location })
    })
  })

  describe('nav', () => {
    it("renders the header's button children as the nav links", () => {
      renderHeader()
      const nav = screen.getByTestId('CampaignHeaderNav')
      const links = within(nav).getAllByRole('link')
      expect(links.map((link) => link.textContent)).toEqual(['Home', 'Resources'])
      expect(links[0]).toHaveAttribute('href', '#heroId')
      expect(links[1]).toHaveAttribute('href', '#carouselId')
    })

    it('collapses the nav into a Menu behind a menu icon below md', () => {
      renderHeader()
      const nav = screen.getByTestId('CampaignHeaderNav')
      expect(mediaRule(nav, 0)).toContain('display:none')
      expect(mediaRule(nav, 600)).toContain('display:flex')
      const button = screen.getByRole('button', { name: 'Open menu' })
      expect(mediaRule(button, 0)).toContain('display:inline-flex')
      expect(mediaRule(button, 600)).toContain('display:none')

      fireEvent.click(button)
      const menu = screen.getByRole('menu')
      const items = within(menu).getAllByRole('menuitem')
      expect(items.map((item) => item.textContent)).toEqual(['Home', 'Resources'])
      expect(items[0]).toHaveAttribute('href', '#heroId')
    })

    it('renders a menu item inert when its target is missing', () => {
      const chrome = chromeBlocks.map((block) =>
        block.id === 'navResourcesId' && block.__typename === 'CampaignButtonBlock'
          ? {
              ...block,
              action: {
                __typename: 'CampaignScrollToBlockAction' as const,
                parentBlockId: block.id,
                blockId: 'regionShareId'
              }
            }
          : block
      )
      renderHeader(withHeader({}, chrome))
      fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
      const resources = screen.getByRole('menuitem', { name: 'Resources' })
      expect(resources).toHaveAttribute('aria-disabled', 'true')
      expect(resources).not.toHaveAttribute('href')
    })

    it('renders no nav and no menu icon when the header has no button children', () => {
      renderHeader(withHeader({}, [headerBlock]))
      expect(screen.queryByTestId('CampaignHeaderNav')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Open menu' })).not.toBeInTheDocument()
      expect(screen.getByTestId('CampaignBrandMark')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('is a sticky AppBar painted from the band table like any section', () => {
      renderHeader(withHeader({ backgroundKind: CampaignBackgroundKind.contrast }))
      const header = screen.getByTestId('CampaignHeader')
      expect(header.tagName).toBe('HEADER')
      expect(header.id).toBe('headerId')
      expect(header).toHaveClass('MuiAppBar-positionSticky')
      expect(baseRule(header)).toContain('position:sticky')
      expect(baseRule(header)).toContain('top:0')
      const band = resolveBand(
        { ...headerBlock, backgroundKind: CampaignBackgroundKind.contrast },
        campaignPublic.theme
      )
      expect(header.style.getPropertyValue('--campaign-band-background')).toBe(band.background)
      expect(header.style.getPropertyValue('--campaign-band-text')).toBe(band.text)
      expect(header.style.getPropertyValue('--campaign-band-accent')).toBe(band.accent)
      expect(band.background).toBe('#26262E')
    })

    it('rule 1: fixed elements take the band text and accent colours; nav buttons follow the button fallback chain', () => {
      renderHeader(
        withHeader({ backgroundKind: CampaignBackgroundKind.contrast, buttonColor: null }),
        { pageKind: CampaignPageKind.regionTemplate, region: eurRegion }
      )
      const chip = baseRule(screen.getByTestId('CampaignAllRegionsChip'))
      expect(chip).toContain('color:var(--campaign-band-text)')
      expect(chip).toContain('border-color:var(--campaign-band-accent)')
      expect(baseRule(screen.getByTestId('CampaignBrandMark'))).toContain(
        'color:var(--campaign-band-text)'
      )
      expect(baseRule(screen.getByTestId('CampaignLanguageSelect'))).toContain(
        'color:var(--campaign-band-text)'
      )
      expect(baseRule(screen.getByRole('button', { name: 'Open menu' }))).toContain(
        'color:var(--campaign-band-text)'
      )
      const [home] = within(screen.getByTestId('CampaignHeaderNav')).getAllByTestId('CampaignButton')
      expect(home).toHaveStyle({ backgroundColor: '#F2B544' })
    })

    it('rule 1: a section buttonColor and a button hex take precedence on nav buttons', () => {
      const chrome = chromeBlocks.map((block) =>
        block.id === 'navResourcesId' ? { ...block, color: '#112233' } : block
      )
      renderHeader(withHeader({ buttonColor: '#445566' }, chrome))
      const [home, resources] = within(screen.getByTestId('CampaignHeaderNav')).getAllByTestId(
        'CampaignButton'
      )
      expect(home).toHaveStyle({ backgroundColor: '#445566' })
      expect(resources).toHaveStyle({ backgroundColor: '#112233' })
    })

    it('rule 2: honours the image kind with the cover scaled to the header height and the overlay applied', () => {
      renderHeader(
        withHeader(
          {
            backgroundKind: CampaignBackgroundKind.image,
            coverBlockId: 'headerCoverId',
            backgroundOverlay: CampaignBackgroundOverlay.heavy
          },
          [...chromeBlocks, coverBlock]
        )
      )
      const cover = screen.getByTestId('CampaignBandCover')
      expect(cover).toHaveAttribute('src', 'https://images.example.org/cover.jpg')
      expect(cover).toHaveStyle({ objectFit: 'cover', height: '100%' })
      expect(screen.getByTestId('CampaignBandOverlay')).toHaveStyle({
        backgroundColor: 'rgba(0, 0, 0, 0.75)'
      })
      expect(screen.getByTestId('CampaignHeader').style.getPropertyValue('--campaign-band-text')).toBe(
        '#FFFFFF'
      )
    })

    it('renders no cover for a non-image kind or an empty cover slot', () => {
      const { unmount } = renderHeader(
        withHeader({ backgroundKind: CampaignBackgroundKind.image, coverBlockId: null })
      )
      expect(screen.queryByTestId('CampaignBandCover')).not.toBeInTheDocument()
      unmount()
      renderHeader(
        withHeader({ backgroundKind: CampaignBackgroundKind.surface, coverBlockId: 'headerCoverId' }, [
          ...chromeBlocks,
          coverBlock
        ])
      )
      expect(screen.queryByTestId('CampaignBandCover')).not.toBeInTheDocument()
    })
  })
})
