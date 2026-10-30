import { ThemeProvider } from '@mui/material/styles'
import { render, screen, within } from '@testing-library/react'

import {
  CampaignPageKind,
  TypographyAlign
} from '../../../../__generated__/globalTypes'
import { emotionClass, styleText } from '../../../test/emotionStyles'
import { shouldRenderSection } from '../CampaignPage/shouldRenderSection'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { transformCampaignBlocks } from '../libs/transformer'
import {
  campaignPublic,
  featuredMediaImageBlock,
  heroVideoBlock,
  landingBlocks
} from '../testData'
import type { CampaignBlock, CampaignTreeOf } from '../types'

import { CampaignHero } from './CampaignHero'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => false
}))

const theme = createCampaignTheme(campaignPublic.theme, false)

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

function heroTree(
  overrides: Partial<CampaignTreeOf<'CampaignHeroBlock'>> = {},
  extraBlocks: typeof landingBlocks = []
): CampaignTreeOf<'CampaignHeroBlock'> {
  const hero = landingBlocks.find((block) => block.id === 'heroId')
  if (hero == null || hero.__typename !== 'CampaignHeroBlock')
    throw new Error('fixture')
  const tree = transformCampaignBlocks([
    { ...hero, ...overrides },
    ...extraBlocks
  ])[0]
  return tree as CampaignTreeOf<'CampaignHeroBlock'>
}

function renderHero(
  block: CampaignTreeOf<'CampaignHeroBlock'>,
  pageHeadingBlockId?: string | null
) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider
        value={{
          campaign: campaignPublic,
          pageKind: CampaignPageKind.landing,
          region: null,
          pageHeadingBlockId
        }}
      >
        <CampaignHero block={block} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

describe('CampaignHero', () => {
  it('renders eyebrow, title and description', () => {
    renderHero(heroTree())
    expect(screen.getByTestId('CampaignEyebrow')).toHaveTextContent(
      'Outreach 2026'
    )
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Share the story of Outreach'
      })
    ).toBeInTheDocument()
    expect(screen.getByTestId('CampaignDescription')).toHaveTextContent(
      'Pick your region to find a journey in your language, ready to share.'
    )
  })

  it('keeps its title an h1 when the page names no heading block, or names this hero', () => {
    const { unmount } = renderHero(heroTree())
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Share the story of Outreach'
    )
    unmount()
    renderHero(heroTree(), 'heroId')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Share the story of Outreach'
    )
  })

  it('renders its title as an h2 with the h1 look when the page heading is another block', () => {
    renderHero(heroTree(), 'regionHeaderId')
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    const title = screen.getByRole('heading', { level: 2 })
    expect(title).toHaveTextContent('Share the story of Outreach')
    expect(title).toHaveClass('MuiTypography-h1')
  })

  it('applies align to the band and the heading', () => {
    renderHero(heroTree({ align: TypographyAlign.center }))
    expect(screen.getByTestId('CampaignSectionBand-heroId')).toHaveStyle({
      textAlign: 'center'
    })
    expect(screen.getByTestId('CampaignTitle')).toBeInTheDocument()
  })

  it('renders nothing for an empty text field', () => {
    renderHero(heroTree({ eyebrow: null, description: '' }))
    expect(screen.queryByTestId('CampaignEyebrow')).not.toBeInTheDocument()
    expect(screen.queryByTestId('CampaignDescription')).not.toBeInTheDocument()
    expect(screen.getByTestId('CampaignTitle')).toBeInTheDocument()
  })

  it('renders no media slot when the hero owns no media block', () => {
    renderHero(heroTree())
    expect(screen.queryByTestId('CampaignMediaSlot')).not.toBeInTheDocument()
    expect(screen.queryByTestId('CampaignMediaSplit')).not.toBeInTheDocument()
  })

  it('The hero renders its media slot beside its text', async () => {
    renderHero(heroTree({ mediaBlockId: heroVideoBlock.id }, [heroVideoBlock]))
    const split = screen.getByTestId('CampaignMediaSplit')
    expect(split).toHaveAttribute('data-media-side', 'right')
    expect(split.firstElementChild).toContainElement(
      screen.getByTestId('CampaignTitle')
    )
    expect(split.lastElementChild).toHaveAttribute(
      'data-testid',
      'CampaignMediaSlot'
    )
    expect(
      await within(split.lastElementChild as HTMLElement).findByTestId(
        'JourneysVideo-heroVideoId'
      )
    ).toBeInTheDocument()
    expect(mediaRule(split, 0)).toContain('grid-template-columns:1fr;')
    expect(mediaRule(split, 600)).toContain('grid-template-columns:1fr 1fr;')
  })

  it('renders an image in its media slot, loaded eagerly with high priority', () => {
    const image = {
      ...featuredMediaImageBlock,
      id: 'heroImageId',
      parentBlockId: 'heroId'
    } as CampaignBlock
    renderHero(heroTree({ mediaBlockId: 'heroImageId' }, [image]))
    const picture = within(screen.getByTestId('CampaignMediaSlot')).getByRole(
      'img',
      { name: 'Children watching a film' }
    )
    expect(picture).toHaveAttribute('loading', 'eager')
    expect(picture).toHaveAttribute('fetchpriority', 'high')
  })

  it('loads its video’s poster eagerly with high priority', () => {
    renderHero(heroTree({ mediaBlockId: heroVideoBlock.id }, [heroVideoBlock]))
    const poster = within(screen.getByTestId('CampaignMediaSlot')).getByTestId(
      'CampaignImage'
    )
    expect(poster).toHaveAttribute('loading', 'eager')
    expect(poster).toHaveAttribute('fetchpriority', 'high')
  })

  it('renders the media alone when the hero has only media', async () => {
    const hero = heroTree(
      {
        eyebrow: null,
        title: '',
        description: null,
        mediaBlockId: heroVideoBlock.id
      },
      [heroVideoBlock]
    )
    expect(
      shouldRenderSection(hero, {
        pageKind: CampaignPageKind.landing,
        region: null,
        regions: campaignPublic.regions,
        strings: campaignPublic.strings
      })
    ).toBe(true)
    renderHero(hero)
    expect(screen.queryByTestId('CampaignMediaSplit')).not.toBeInTheDocument()
    expect(screen.queryByTestId('CampaignTitle')).not.toBeInTheDocument()
    expect(
      await screen.findByTestId('JourneysVideo-heroVideoId')
    ).toBeInTheDocument()
  })
})
