import { ThemeProvider } from '@mui/material/styles'
import { render, screen, within } from '@testing-library/react'

import {
  CampaignPageKind,
  TypographyAlign
} from '../../../../__generated__/globalTypes'
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

function renderHero(block: CampaignTreeOf<'CampaignHeroBlock'>) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider
        value={{
          campaign: campaignPublic,
          pageKind: CampaignPageKind.landing,
          region: null
        }}
      >
        <CampaignHero block={block} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

describe('CampaignHero', () => {
  it('renders eyebrow, title and lede', () => {
    renderHero(heroTree())
    expect(screen.getByTestId('CampaignEyebrow')).toHaveTextContent(
      'Christmas 2026'
    )
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Share the story of Christmas'
      })
    ).toBeInTheDocument()
    expect(screen.getByTestId('CampaignLede')).toHaveTextContent(
      'Pick your region to find a journey in your language, ready to share.'
    )
  })

  it('applies align to the band and the heading', () => {
    renderHero(heroTree({ align: TypographyAlign.center }))
    expect(screen.getByTestId('CampaignSectionBand-heroId')).toHaveStyle({
      textAlign: 'center'
    })
    expect(screen.getByTestId('CampaignTitle')).toBeInTheDocument()
  })

  it('renders nothing for an empty text field', () => {
    renderHero(heroTree({ eyebrow: null, lede: '' }))
    expect(screen.queryByTestId('CampaignEyebrow')).not.toBeInTheDocument()
    expect(screen.queryByTestId('CampaignLede')).not.toBeInTheDocument()
    expect(screen.getByTestId('CampaignTitle')).toBeInTheDocument()
  })

  it('renders no media slot when the hero owns no media block', () => {
    renderHero(heroTree())
    expect(screen.queryByTestId('CampaignMediaSlot')).not.toBeInTheDocument()
    expect(screen.queryByTestId('CampaignMediaSplit')).not.toBeInTheDocument()
  })

  it('The hero renders its media slot beside its text', () => {
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
      within(split.lastElementChild as HTMLElement).getByTestId(
        'JourneysVideo-heroVideoId'
      )
    ).toBeInTheDocument()
    expect(mediaRule(split, 0)).toContain('grid-template-columns:1fr;')
    expect(mediaRule(split, 600)).toContain('grid-template-columns:1fr 1fr;')
  })

  it('renders an image in its media slot', () => {
    const image = {
      ...featuredMediaImageBlock,
      id: 'heroImageId',
      parentBlockId: 'heroId'
    } as CampaignBlock
    renderHero(heroTree({ mediaBlockId: 'heroImageId' }, [image]))
    expect(
      within(screen.getByTestId('CampaignMediaSlot')).getByRole('img', {
        name: 'Children watching a film'
      })
    ).toBeInTheDocument()
  })

  it('renders the media alone when the hero has only media', () => {
    const hero = heroTree(
      {
        eyebrow: null,
        title: '',
        lede: null,
        mediaBlockId: heroVideoBlock.id
      },
      [heroVideoBlock]
    )
    expect(
      shouldRenderSection(hero, {
        pageKind: CampaignPageKind.landing,
        region: null,
        regions: campaignPublic.regions
      })
    ).toBe(true)
    renderHero(hero)
    expect(screen.queryByTestId('CampaignMediaSplit')).not.toBeInTheDocument()
    expect(screen.queryByTestId('CampaignTitle')).not.toBeInTheDocument()
    expect(screen.getByTestId('JourneysVideo-heroVideoId')).toBeInTheDocument()
  })
})
