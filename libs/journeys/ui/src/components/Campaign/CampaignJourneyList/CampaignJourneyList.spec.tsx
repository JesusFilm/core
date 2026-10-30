import { ThemeProvider } from '@mui/material/styles'
import { render, screen, within } from '@testing-library/react'

import {
  CampaignJourneyListDisplay,
  CampaignPageKind,
  CampaignStringKey,
  JourneyStatus
} from '../../../../__generated__/globalTypes'
import { shouldRenderSection } from '../CampaignPage'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { transformCampaignBlocks } from '../libs/transformer'
import { campaignPublic, journeyCard, landingBlocks } from '../testData'
import type { CampaignBlock, CampaignPublic, CampaignTreeOf } from '../types'

import { CampaignJourneyList, liveJourneyCards } from './CampaignJourneyList'

const theme = createCampaignTheme(campaignPublic.theme, false)

const LIST_ID = 'landingJourneyListId'

function item(
  id: string,
  parentOrder: number,
  overrides: Partial<Parameters<typeof journeyCard>[0]> = {}
): CampaignBlock {
  return journeyCard({
    id,
    parentBlockId: LIST_ID,
    pageId: 'landingPageId',
    parentOrder,
    title: `${id} title`,
    description: `${id} description`,
    journeyUrl: `https://journeys.example.org/${id}`,
    ...overrides
  })
}

/** The seeded landing journey list with its fixture items replaced by `items`. */
function listTree(
  items: CampaignBlock[],
  overrides: Partial<CampaignTreeOf<'CampaignJourneyListBlock'>> = {}
): CampaignTreeOf<'CampaignJourneyListBlock'> {
  const list = landingBlocks.find((block) => block.id === LIST_ID)
  if (list == null || list.__typename !== 'CampaignJourneyListBlock')
    throw new Error('fixture')
  const blocks: CampaignBlock[] = [{ ...list, ...overrides }, ...items]
  return transformCampaignBlocks(
    blocks
  )[0] as CampaignTreeOf<'CampaignJourneyListBlock'>
}

function renderList(
  block: CampaignTreeOf<'CampaignJourneyListBlock'>,
  campaign: CampaignPublic = campaignPublic
) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider
        value={{
          campaign,
          pageKind: CampaignPageKind.landing,
          region: null
        }}
      >
        <CampaignJourneyList block={block} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

describe('CampaignJourneyList', () => {
  it('renders a card for each live-published journey, in order, with its snapshot and live image', () => {
    renderList(
      listTree([
        item('second', 1),
        item('first', 0),
        item('third', 2, { description: null })
      ])
    )

    const cards = screen.getAllByTestId(/^CampaignJourneyCard-/)
    expect(cards.map((card) => card.dataset.testid)).toEqual([
      'CampaignJourneyCard-first',
      'CampaignJourneyCard-second',
      'CampaignJourneyCard-third'
    ])
    const first = within(cards[0])
    expect(first.getByTestId('CampaignJourneyCardTitle')).toHaveTextContent(
      'first title'
    )
    expect(
      first.getByTestId('CampaignJourneyCardDescription')
    ).toHaveTextContent('first description')
    expect(first.getByTestId('CampaignJourneyCardImage')).toHaveAttribute(
      'src',
      'https://imagedelivery.net/outreach-story/public'
    )
    expect(
      within(cards[2]).queryByTestId('CampaignJourneyCardDescription')
    ).not.toBeInTheDocument()
  })

  it('renders a card without its image when the image src is not https', () => {
    renderList(
      listTree([
        item('insecure', 0, {
          journeyImage: {
            __typename: 'CampaignJourneyImage',
            src: 'http://images.example.org/cover.jpg',
            alt: 'Cover'
          }
        })
      ])
    )

    expect(
      screen.getByTestId('CampaignJourneyCard-insecure')
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('CampaignJourneyCardImage')
    ).not.toBeInTheDocument()
  })

  it('omits a card whose journey is neither published nor archived, and keeps an archived one', () => {
    renderList(
      listTree([
        item('live', 0),
        item('draft', 1, {
          journeyStatus: JourneyStatus.draft,
          journeyUrl: null
        }),
        item('archived', 2, { journeyStatus: JourneyStatus.archived }),
        item('trashed', 3, { journeyStatus: null, journeyUrl: null })
      ])
    )

    expect(
      screen
        .getAllByTestId(/^CampaignJourneyCard-/)
        .map((card) => card.dataset.testid)
    ).toEqual(['CampaignJourneyCard-live', 'CampaignJourneyCard-archived'])
  })

  it('links each card to the journey’s own public address with the openTemplate string', () => {
    renderList(listTree([item('live', 0)]))

    const open = screen.getByTestId('CampaignJourneyCardOpen')
    expect(open).toHaveTextContent('Open journey')
    expect(open).toHaveAttribute('href', 'https://journeys.example.org/live')
  })

  it('takes the open label from the campaign’s own openTemplate string', () => {
    renderList(listTree([item('live', 0)]), {
      ...campaignPublic,
      strings: campaignPublic.strings.map((string) =>
        string.key === CampaignStringKey.openTemplate
          ? { ...string, value: 'Ouvrir le parcours' }
          : string
      )
    })

    expect(screen.getByTestId('CampaignJourneyCardOpen')).toHaveTextContent(
      'Ouvrir le parcours'
    )
  })

  it('leaves a blank openTemplate string blank, keeping Open as the accessible name', () => {
    renderList(listTree([item('live', 0)]), {
      ...campaignPublic,
      strings: campaignPublic.strings.map((string) =>
        string.key === CampaignStringKey.openTemplate
          ? { ...string, value: '' }
          : string
      )
    })

    const open = screen.getByRole('link', { name: 'Open' })
    expect(open).toHaveAttribute('data-testid', 'CampaignJourneyCardOpen')
    expect(open).toHaveTextContent(/^$/)
  })

  it('keeps line breaks in the card title and the open label', () => {
    renderList(listTree([item('live', 0, { title: 'Live\njourney' })]), {
      ...campaignPublic,
      strings: campaignPublic.strings.map((string) =>
        string.key === CampaignStringKey.openTemplate
          ? { ...string, value: 'Open\njourney' }
          : string
      )
    })

    const title = screen.getByTestId('CampaignJourneyCardTitle')
    expect(title.textContent).toBe('Live\njourney')
    expect(title).toHaveStyle({ whiteSpace: 'pre-line' })
    const open = screen.getByTestId('CampaignJourneyCardOpen')
    expect(open.textContent).toBe('Open\njourney')
    expect(open).toHaveStyle({ whiteSpace: 'pre-line' })
  })

  it('lays cards out as a grid or a list', () => {
    const { unmount } = renderList(listTree([item('live', 0)]))
    expect(screen.getByTestId('CampaignJourneyCards')).toHaveAttribute(
      'data-display',
      'grid'
    )
    unmount()

    renderList(
      listTree([item('live', 0)], { display: CampaignJourneyListDisplay.list })
    )
    expect(screen.getByTestId('CampaignJourneyCards')).toHaveAttribute(
      'data-display',
      'list'
    )
  })

  it('is a single column below md and auto-fills at md and up in a grid', () => {
    renderList(listTree([item('live', 0)]))

    const css = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('')
    expect(css).toContain('grid-template-columns:1fr')
    expect(css).toMatch(
      /@media \(min-width:600px\)[^}]*\{[^}]*grid-template-columns:repeat\(auto-fill,\s*minmax\(260px,\s*1fr\)\)/
    )
  })

  it('renders the heading and the noJourneys string when no journey is live', () => {
    renderList(
      listTree([
        item('draft', 0, {
          journeyStatus: JourneyStatus.draft,
          journeyUrl: null
        })
      ])
    )

    expect(screen.getByTestId('CampaignTitle')).toHaveTextContent(
      'Ready-made journeys'
    )
    expect(screen.getByTestId('CampaignJourneyListEmpty')).toHaveTextContent(
      'Journeys for this region are coming soon'
    )
    expect(screen.queryByTestId('CampaignJourneyCards')).not.toBeInTheDocument()
  })

  it('renders the noJourneys string on a list with no items at all', () => {
    renderList(listTree([]))

    expect(screen.getByTestId('CampaignJourneyListEmpty')).toBeInTheDocument()
  })

  it('renders the cards and no noJourneys string when a journey is live', () => {
    renderList(listTree([item('live', 0)]))

    expect(screen.getByTestId('CampaignJourneyCards')).toBeInTheDocument()
    expect(
      screen.queryByTestId('CampaignJourneyListEmpty')
    ).not.toBeInTheDocument()
  })

  it('takes the empty-state line from the campaign’s own noJourneys string', () => {
    renderList(listTree([]), {
      ...campaignPublic,
      strings: campaignPublic.strings.map((string) =>
        string.key === CampaignStringKey.noJourneys
          ? { ...string, value: 'Bientôt des parcours' }
          : string
      )
    })

    expect(screen.getByTestId('CampaignJourneyListEmpty')).toHaveTextContent(
      'Bientôt des parcours'
    )
  })

  describe('liveJourneyCards', () => {
    it('keeps only published or archived items that have an address', () => {
      const tree = listTree([
        item('live', 0),
        item('noUrl', 1, { journeyUrl: null }),
        item('draft', 2, {
          journeyStatus: JourneyStatus.draft,
          journeyUrl: null
        }),
        item('archived', 3, { journeyStatus: JourneyStatus.archived })
      ])

      expect(liveJourneyCards(tree).map((card) => card.id)).toEqual([
        'live',
        'archived'
      ])
    })
  })

  describe('shouldRenderSection', () => {
    const context = {
      pageKind: CampaignPageKind.landing,
      region: null,
      regions: campaignPublic.regions,
      strings: campaignPublic.strings
    }
    const noText = { eyebrow: null, title: null, description: null }
    const noLine = {
      ...context,
      strings: campaignPublic.strings.filter(
        (string) => string.key !== CampaignStringKey.noJourneys
      )
    }

    it('renders the text or the noJourneys line when there are no live journeys, else the section is skipped', () => {
      const draftOnly = item('draft', 0, {
        journeyStatus: JourneyStatus.draft,
        journeyUrl: null
      })

      expect(shouldRenderSection(listTree([draftOnly]), noLine)).toBe(true)
      expect(shouldRenderSection(listTree([draftOnly], noText), context)).toBe(
        true
      )
      expect(shouldRenderSection(listTree([draftOnly], noText), noLine)).toBe(
        false
      )
      expect(shouldRenderSection(listTree([], noText), noLine)).toBe(false)
    })

    it('renders cards alone when the section has no text', () => {
      expect(
        shouldRenderSection(listTree([item('live', 0)], noText), context)
      ).toBe(true)
    })
  })
})
