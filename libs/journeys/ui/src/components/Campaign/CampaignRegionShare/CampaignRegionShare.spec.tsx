import { ThemeProvider } from '@mui/material/styles'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import {
  CampaignPageKind,
  CampaignStringKey,
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
  PREVIEW_IFRAME_SANDBOX,
  defaultShareLanguage,
  displayShortLink,
  previewEmbedUrl,
  qrCodeFileName,
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
  const published = journeyStatus === JourneyStatus.published
  return {
    __typename: 'CampaignRegionLanguagePublic',
    id,
    languageId,
    order,
    journeyStatus,
    title: published ? `${autonym} journey` : null,
    shortLinkUrl: published ? `https://short.nextstep.is/${id}` : null,
    journeyUrl: published ? `https://your.nextstep.is/${id}` : null,
    embedUrl: published ? `https://your.nextstep.is/embed/${id}` : null,
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

/** The campaign with its Share strings reworded, so a string's source is unmistakable. */
const rewordedCampaign: CampaignPublic = {
  ...campaignPublic,
  strings: campaignPublic.strings.map((string) => {
    const reworded: Partial<Record<CampaignStringKey, string>> = {
      [CampaignStringKey.step1]: 'Choisissez une langue.',
      [CampaignStringKey.step2]: 'Regardez ce qu’ils verront.',
      [CampaignStringKey.step2help]: 'Parcourez l’aperçu comme eux.',
      [CampaignStringKey.step3]: 'Partagez ce lien.',
      [CampaignStringKey.step4]: 'Ou téléchargez le code QR.',
      [CampaignStringKey.copy]: 'Copier le lien',
      [CampaignStringKey.copied]: 'Lien copié',
      [CampaignStringKey.downloadQr]: 'Télécharger le code QR',
      [CampaignStringKey.open]: 'Ouvrir'
    }
    const value = reworded[string.key]
    return value == null ? string : { ...string, value }
  })
}

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

function styleText(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((node) => node.textContent ?? '')
    .join('')
}

describe('CampaignRegionShare', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: vi.fn(),
      writable: true,
      configurable: true
    })
  })

  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true
    })
  })

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

  describe('helpers', () => {
    it('keeps the preview on the root-domain embed route with expand=false', () => {
      expect(previewEmbedUrl('https://your.nextstep.is/embed/eur-en')).toBe(
        'https://your.nextstep.is/embed/eur-en?expand=false'
      )
    })

    it('names the PNG <campaign slug>-<region slug>-<language bcp47>.png, falling back to the language id', () => {
      expect(qrCodeFileName(campaignPublic, region, languages[0])).toBe(
        'christmas-2026-eur-en.png'
      )
      expect(
        qrCodeFileName(campaignPublic, region, {
          ...languages[0],
          language: { ...languages[0].language, bcp47: null }
        })
      ).toBe('christmas-2026-eur-529.png')
    })

    it('shows the Share Link without its scheme', () => {
      expect(displayShortLink('https://short.nextstep.is/eur-en')).toBe(
        'short.nextstep.is/eur-en'
      )
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

  it('takes the four step labels, the help line and the button texts from the Campaign Strings', () => {
    renderShare(region, rewordedCampaign)

    expect(
      screen.getByRole('combobox', { name: 'Choisissez une langue.' })
    ).toBeInTheDocument()
    expect(screen.getByText('Regardez ce qu’ils verront.')).toBeInTheDocument()
    expect(
      screen.getByText('Parcourez l’aperçu comme eux.')
    ).toBeInTheDocument()
    expect(screen.getByText('Partagez ce lien.')).toBeInTheDocument()
    expect(screen.getByText('Ou téléchargez le code QR.')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Copier le lien' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Télécharger le code QR' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ouvrir' })).toBeInTheDocument()
  })

  it('previews the journey in a sandboxed phone frame on the root-domain embed route, titled with the snapshot, whose Open opens the Share Link in a new tab', () => {
    renderShare()

    const iframe = screen.getByTestId('CampaignRegionSharePhoneIframe')
    expect(iframe).toHaveAttribute(
      'src',
      'https://your.nextstep.is/embed/eur-en?expand=false'
    )
    expect(iframe).toHaveAttribute('sandbox', PREVIEW_IFRAME_SANDBOX)
    expect(iframe).toHaveAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox'
    )
    expect(iframe).toHaveAttribute('allow', 'autoplay')
    expect(iframe).toHaveAttribute('loading', 'lazy')
    expect(iframe).toHaveAttribute('title', 'English journey')

    const open = screen.getByRole('link', { name: 'Open' })
    expect(open).toHaveAttribute('href', 'https://short.nextstep.is/eur-en')
    expect(open).toHaveAttribute('target', '_blank')
    expect(open).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('copies the Share Link, shows the copied toast, and never hands out the long journey URL', async () => {
    renderShare(region, rewordedCampaign)

    expect(
      screen.getByTestId('CampaignRegionShareShortLink')
    ).toHaveTextContent('short.nextstep.is/eur-en')
    expect(document.body.innerHTML).not.toContain(
      'https://your.nextstep.is/eur-en'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Copier le lien' }))

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'https://short.nextstep.is/eur-en'
      )
    )
    expect(await screen.findByText('Lien copié')).toBeInTheDocument()
  })

  it('draws the QR code of the Share Link and downloads it as the named 1024 px PNG', () => {
    const toDataURL = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/png;base64,QR')
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)
    renderShare()

    const canvas = screen.getByRole('img', {
      name: 'https://short.nextstep.is/eur-en'
    })
    expect(canvas).toHaveAttribute('width', '1024')

    fireEvent.click(screen.getByRole('button', { name: 'Download QR code' }))

    expect(toDataURL).toHaveBeenCalledWith('image/png')
    const clicked = click.mock.contexts[0] as HTMLAnchorElement
    expect(clicked.download).toBe('christmas-2026-eur-en.png')
    expect(clicked.href).toBe('data:image/png;base64,QR')
    toDataURL.mockRestore()
    click.mockRestore()
  })

  it('switches the selected language, retargeting the frame, the link and the code', () => {
    renderShare()

    fireEvent.mouseDown(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: 'Français' }))

    expect(screen.getByRole('combobox')).toHaveTextContent('Français')
    expect(
      screen.getByTestId('CampaignRegionSharePhoneIframe')
    ).toHaveAttribute(
      'src',
      'https://your.nextstep.is/embed/eur-fr?expand=false'
    )
    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute(
      'href',
      'https://short.nextstep.is/eur-fr'
    )
    expect(
      screen.getByRole('img', { name: 'https://short.nextstep.is/eur-fr' })
    ).toBeInTheDocument()
  })

  it('stacks the panel single column below md and side by side at md and up', () => {
    renderShare()

    expect(screen.getByTestId('CampaignRegionSharePanel')).toBeInTheDocument()
    const css = styleText()
    expect(css).toContain('flex-direction:column')
    expect(css).toMatch(
      /@media \(min-width:600px\)[^}]*\{[^}]*flex-direction:row/
    )
  })

  it("falls back to the region's first language when the page language has no journey", () => {
    renderShare(region, { ...campaignPublic, languageId: '21028' })

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
    expect(
      screen.queryByTestId('CampaignRegionSharePhone')
    ).not.toBeInTheDocument()
  })

  it('renders title and intro only without a region', () => {
    renderShare(null)

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })
})
