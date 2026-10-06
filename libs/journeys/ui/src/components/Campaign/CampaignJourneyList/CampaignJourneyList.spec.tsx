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
      'https://imagedelivery.net/christmas-story/public'
    )
    expect(
      within(cards[2]).queryByTestId('CampaignJourneyCardDescription')
    ).not.toBeInTheDocument()
  })

  it('omits a card whose journey is not live-published', () => {
    renderList(
      listTree([
        item('live', 0),
        item('draft', 1, {
          journeyStatus: JourneyStatus.draft,
          journeyUrl: null
        }),
        item('archived', 2, {
          journeyStatus: JourneyStatus.archived,
          journeyUrl: null
        }),
        item('trashed', 3, { journeyStatus: null, journeyUrl: null })
      ])
    )

    expect(
      screen
        .getAllByTestId(/^CampaignJourneyCard-/)
        .map((card) => card.dataset.testid)
    ).toEqual(['CampaignJourneyCard-live'])
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

  it('renders only the heading when no journey is live', () => {
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
    expect(screen.queryByTestId('CampaignJourneyCards')).not.toBeInTheDocument()
  })

  describe('liveJourneyCards', () => {
    it('keeps only published items that have an address', () => {
      const tree = listTree([
        item('live', 0),
        item('noUrl', 1, { journeyUrl: null }),
        item('draft', 2, {
          journeyStatus: JourneyStatus.draft,
          journeyUrl: null
        })
      ])

      expect(liveJourneyCards(tree).map((card) => card.id)).toEqual(['live'])
    })
  })

  describe('shouldRenderSection', () => {
    const context = {
      pageKind: CampaignPageKind.landing,
      region: null,
      regions: campaignPublic.regions
    }
    const noText = { eyebrow: null, title: null, lede: null }

    it('renders the text when there are no live journeys, else the section is skipped', () => {
      const draftOnly = item('draft', 0, {
        journeyStatus: JourneyStatus.draft,
        journeyUrl: null
      })

      expect(shouldRenderSection(listTree([draftOnly]), context)).toBe(true)
      expect(shouldRenderSection(listTree([draftOnly], noText), context)).toBe(
        false
      )
      expect(shouldRenderSection(listTree([], noText), context)).toBe(false)
    })

    it('renders cards alone when the section has no text', () => {
      expect(
        shouldRenderSection(listTree([item('live', 0)], noText), context)
      ).toBe(true)
    })
  })
})
