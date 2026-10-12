import { ThemeProvider } from '@mui/material/styles'
import { render, screen, within } from '@testing-library/react'

import {
  CampaignMediaSide,
  CampaignPageKind
} from '../../../../__generated__/globalTypes'
import { shouldRenderSection } from '../CampaignPage/shouldRenderSection'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { transformCampaignBlocks } from '../libs/transformer'
import {
  campaignPublic,
  featuredMediaImageBlock,
  featuredMediaSectionBlock,
  heroVideoBlock,
  landingBlocks
} from '../testData'
import type { CampaignBlock, CampaignTreeOf } from '../types'

import { CampaignFeaturedMedia } from './CampaignFeaturedMedia'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => false
}))

const theme = createCampaignTheme(campaignPublic.theme, false)

const NO_TEXT = {
  eyebrow: null,
  title: '',
  lede: null,
  bullets: ' \n '
} as Partial<CampaignBlock>

function styleText(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((node) => node.textContent ?? '')
    .join('')
}

function emotionClass(element: Element): string {
  const name = Array.from(element.classList).find((candidate) =>
    candidate.startsWith('css-')
  )
  if (name == null) throw new Error('no emotion class')
  return name.replace(/[-]/g, '\\-')
}

/** The element's emotion rule body under the `min-width` media query. */
function mediaRule(element: Element, minWidth: number): string {
  return (
    styleText().match(
      new RegExp(
        `@media \\(min-width:${minWidth}px\\)[^{]*\\{\\.${emotionClass(element)}\\{([^}]*)\\}`
      )
    )?.[1] ?? ''
  )
}

function featuredTree(
  overrides: Partial<CampaignBlock> = {},
  ownedBlocks: CampaignBlock[] = [featuredMediaImageBlock]
): CampaignTreeOf<'CampaignFeaturedMediaBlock'> {
  return transformCampaignBlocks([
    { ...featuredMediaSectionBlock, ...overrides } as CampaignBlock,
    ...ownedBlocks
  ])[0] as CampaignTreeOf<'CampaignFeaturedMediaBlock'>
}

function renderFeatured(block: CampaignTreeOf<'CampaignFeaturedMediaBlock'>) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider
        value={{
          campaign: campaignPublic,
          pageKind: CampaignPageKind.landing,
          region: null
        }}
      >
        <CampaignFeaturedMedia block={block} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

const context = {
  pageKind: CampaignPageKind.landing,
  region: null,
  regions: campaignPublic.regions
}

describe('CampaignFeaturedMedia', () => {
  it('renders eyebrow, title, lede and its media inside its band', () => {
    renderFeatured(featuredTree())
    const band = screen.getByTestId('CampaignSectionBand-featuredMediaId')
    expect(within(band).getByTestId('CampaignEyebrow')).toHaveTextContent(
      'Why it matters'
    )
    expect(
      within(band).getByRole('heading', { name: 'A story for every home' })
    ).toBeInTheDocument()
    expect(within(band).getByTestId('CampaignLede')).toHaveTextContent(
      'Short films in the languages your neighbours speak.'
    )
    expect(
      within(band).getByRole('img', { name: 'Children watching a film' })
    ).toHaveAttribute(
      'src',
      'https://imagedelivery.net/accountHash/featuredMedia/public'
    )
  })

  it('splits bullets one per line and drops blank lines', () => {
    renderFeatured(featuredTree())
    const items = within(
      screen.getByTestId('CampaignFeaturedMediaBullets')
    ).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual([
      'Free to share',
      'In over 1,800 languages',
      'Ready for any phone'
    ])
  })

  it('places the media on the mediaSide', () => {
    const { unmount } = renderFeatured(
      featuredTree({
        mediaSide: CampaignMediaSide.left
      })
    )
    let split = screen.getByTestId('CampaignMediaSplit')
    expect(split).toHaveAttribute('data-media-side', 'left')
    expect(split.firstElementChild).toHaveAttribute(
      'data-testid',
      'CampaignMediaSlot'
    )
    unmount()

    renderFeatured(
      featuredTree({
        mediaSide: CampaignMediaSide.right
      })
    )
    split = screen.getByTestId('CampaignMediaSplit')
    expect(split).toHaveAttribute('data-media-side', 'right')
    expect(split.lastElementChild).toHaveAttribute(
      'data-testid',
      'CampaignMediaSlot'
    )
  })

  it('is a single column below md and two columns from md up', () => {
    renderFeatured(featuredTree())
    const split = screen.getByTestId('CampaignMediaSplit')
    expect(mediaRule(split, 0)).toContain('grid-template-columns:1fr;')
    expect(mediaRule(split, 600)).toContain('grid-template-columns:1fr 1fr;')
  })

  it('lays the text full width when the media slot is empty', () => {
    renderFeatured(featuredTree({ mediaBlockId: null }, []))
    expect(screen.queryByTestId('CampaignMediaSplit')).not.toBeInTheDocument()
    expect(screen.queryByTestId('CampaignMediaSlot')).not.toBeInTheDocument()
    expect(screen.getByTestId('CampaignTitle')).toBeInTheDocument()
    expect(
      screen.getByTestId('CampaignFeaturedMediaBullets')
    ).toBeInTheDocument()
  })

  it('treats an image with no src as an empty media slot', () => {
    renderFeatured(
      featuredTree({}, [{ ...featuredMediaImageBlock, src: null }])
    )
    expect(screen.queryByTestId('CampaignMediaSlot')).not.toBeInTheDocument()
    expect(screen.getByTestId('CampaignTitle')).toBeInTheDocument()
  })

  it('renders the media alone when the text is empty', () => {
    renderFeatured(featuredTree(NO_TEXT))
    expect(screen.queryByTestId('CampaignMediaSplit')).not.toBeInTheDocument()
    expect(screen.getByTestId('CampaignMediaSlot')).toBeInTheDocument()
    expect(screen.queryByTestId('CampaignTitle')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('CampaignFeaturedMediaBullets')
    ).not.toBeInTheDocument()
  })

  it('plays a video in its media slot', () => {
    renderFeatured(
      featuredTree({ mediaBlockId: heroVideoBlock.id }, [
        { ...heroVideoBlock, parentBlockId: 'featuredMediaId' }
      ])
    )
    expect(
      within(screen.getByTestId('CampaignMediaSlot')).getByTestId(
        'JourneysVideo-heroVideoId'
      )
    ).toBeInTheDocument()
  })

  it('is skipped by the page only when text and media are both empty and it has no Extras', () => {
    expect(shouldRenderSection(featuredTree(), context)).toBe(true)
    expect(
      shouldRenderSection(featuredTree({ mediaBlockId: null }, []), context)
    ).toBe(true)
    expect(shouldRenderSection(featuredTree(NO_TEXT), context)).toBe(true)
    expect(
      shouldRenderSection(
        featuredTree({ ...NO_TEXT, bullets: 'One bullet' }, []),
        context
      )
    ).toBe(true)
    expect(
      shouldRenderSection(
        featuredTree({ ...NO_TEXT, mediaBlockId: null }, []),
        context
      )
    ).toBe(false)
    const note = landingBlocks.find((block) => block.id === 'journeyListNoteId')
    expect(
      shouldRenderSection(
        featuredTree({ ...NO_TEXT, mediaBlockId: null }, [
          { ...note, parentBlockId: 'featuredMediaId' } as CampaignBlock
        ]),
        context
      )
    ).toBe(true)
  })
})
