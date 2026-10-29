import Button from '@mui/material/Button'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement, useState } from 'react'

import { GET_CAMPAIGN_STATS } from '@core/journeys/ui/Campaign'
import { campaignStatsFixture } from '@core/journeys/ui/Campaign/testData'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import {
  CampaignFeaturedMediaLayout,
  CampaignPageKind,
  CampaignTextSource,
  VideoBlockSource
} from '../../../../__generated__/globalTypes'
import { CAMPAIGN_BLOCK_ORDER_UPDATE } from '../../../libs/useCampaignBlockOrderUpdateMutation'
import { CAMPAIGN_REGION_ORDER_UPDATE } from '../../../libs/useCampaignRegionOrderUpdateMutation'
import { newOwnedVideoBlock } from '../../../libs/useCampaignVideoBlockCreateMutation'
import { campaign, campaignWithColumns, campaignWithRegions } from '../data'
import {
  CommandProbe,
  SelectionProbe,
  StaticEditor,
  frameBody
} from '../testing'
import { newSectionBlock } from '../utils/sectionTypes'

import { Canvas, dropEdgeFor, dropParentOrder, regionDropOrder } from './Canvas'
import type { CanvasView } from './Canvas'

const mockWebFontLoader = { load: vi.fn() }

vi.mock('webfontloader', () => mockWebFontLoader)

const LANDING_SECTION_IDS = [
  'heroId',
  'landingSwitcherId',
  'carouselId',
  'landingJourneyListId',
  'landingAnalyticsId'
]

const orderMock = {
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'heroId', parentOrder: 1 }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockOrderUpdate: [
        {
          __typename: 'CampaignRegionSwitcherBlock',
          id: 'landingSwitcherId',
          parentOrder: 0
        },
        { __typename: 'CampaignHeroBlock', id: 'heroId', parentOrder: 1 }
      ]
    }
  }))
}

const statsMock = {
  request: {
    query: GET_CAMPAIGN_STATS,
    variables: { id: campaign.id }
  },
  result: vi.fn(() => ({ data: { campaignStats: campaignStatsFixture } }))
}

const swapMock = {
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'slotLeftId', parentOrder: 1 }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockOrderUpdate: [
        {
          __typename: 'CampaignColumnBlock',
          id: 'slotRightId',
          parentOrder: 0
        },
        { __typename: 'CampaignColumnBlock', id: 'slotLeftId', parentOrder: 1 }
      ]
    }
  }))
}

function ViewHarness(): ReactElement {
  const [view, setView] = useState<CanvasView>('desktop')
  return (
    <StaticEditor>
      <Button onClick={() => setView(view === 'desktop' ? 'phone' : 'desktop')}>
        Toggle view
      </Button>
      <CommandProbe />
      <Canvas
        campaign={campaign}
        pageKind={CampaignPageKind.landing}
        view={view}
      />
    </StaticEditor>
  )
}

/** Europe dragged onto Africa takes its place: Africa first, Europe second. */
const regionOrderMock = {
  request: {
    query: CAMPAIGN_REGION_ORDER_UPDATE,
    variables: { id: 'eurRegionId', order: 1 }
  },
  result: vi.fn(() => ({
    data: {
      campaignRegionOrderUpdate: [
        { __typename: 'CampaignRegion', id: 'afrRegionId', order: 0 },
        { __typename: 'CampaignRegion', id: 'eurRegionId', order: 1 }
      ]
    }
  }))
}

function renderCanvas(
  pageKind = CampaignPageKind.landing,
  view: CanvasView = 'desktop',
  canvasCampaign: Campaign = campaign
): ReturnType<typeof render> {
  return render(
    <StaticEditor
      mocks={[orderMock, regionOrderMock]}
      campaignProp={canvasCampaign}
    >
      <SelectionProbe />
      <CommandProbe />
      <Canvas campaign={canvasCampaign} pageKind={pageKind} view={view} />
    </StaticEditor>
  )
}

/** Stack the landing sections 100 px tall each, since jsdom lays nothing out. */
function stackSections(body: HTMLElement): void {
  LANDING_SECTION_IDS.forEach((id, index) => {
    const section = body.querySelector(
      `[data-testid="CanvasSection-${id}"]`
    ) as HTMLElement
    const top = index * 100
    section.getBoundingClientRect = () => ({
      top,
      bottom: top + 100,
      left: 0,
      right: 800,
      width: 800,
      height: 100,
      x: 0,
      y: top,
      toJSON: () => ({})
    })
  })
}

describe('Canvas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // The Analytics section asks the viewer for its world map atlas.
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('offline')))
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('dropEdgeFor', () => {
    it('decides before or after by the midpoint of the section under the pointer', () => {
      expect(dropEdgeFor(149, { top: 100, height: 100 })).toBe('before')
      expect(dropEdgeFor(150, { top: 100, height: 100 })).toBe('after')
    })
  })

  describe('dropParentOrder', () => {
    const ids = ['a', 'b', 'c', 'd']

    it('moves down to after the section under the pointer, accounting for the gap it leaves', () => {
      expect(dropParentOrder(ids, 'a', { overId: 'c', edge: 'after' })).toBe(2)
      expect(dropParentOrder(ids, 'a', { overId: 'c', edge: 'before' })).toBe(1)
    })

    it('moves up to before or after the section under the pointer', () => {
      expect(dropParentOrder(ids, 'd', { overId: 'b', edge: 'before' })).toBe(1)
      expect(dropParentOrder(ids, 'd', { overId: 'b', edge: 'after' })).toBe(2)
    })

    it('is a no-op when the drop lands where the section already is', () => {
      expect(
        dropParentOrder(ids, 'b', { overId: 'a', edge: 'after' })
      ).toBeUndefined()
      expect(
        dropParentOrder(ids, 'b', { overId: 'c', edge: 'before' })
      ).toBeUndefined()
      expect(
        dropParentOrder(ids, 'x', { overId: 'c', edge: 'before' })
      ).toBeUndefined()
    })
  })

  describe('regionDropOrder', () => {
    const ids = ['eur', 'afr', 'nao']

    it('takes the place of the card the drop lands on, in either direction', () => {
      expect(regionDropOrder(ids, 'eur', 'nao')).toBe(2)
      expect(regionDropOrder(ids, 'nao', 'eur')).toBe(0)
    })

    it('is a no-op on itself, on nothing, or on an unknown card', () => {
      expect(regionDropOrder(ids, 'eur', 'eur')).toBeUndefined()
      expect(regionDropOrder(ids, 'eur', undefined)).toBeUndefined()
      expect(regionDropOrder(ids, 'eur', 'x')).toBeUndefined()
      expect(regionDropOrder(ids, 'x', 'eur')).toBeUndefined()
    })
  })

  it('reorders a region card dragged by its handle onto another card, as one Command', async () => {
    const { baseElement } = renderCanvas(
      CampaignPageKind.landing,
      'desktop',
      campaignWithRegions
    )
    const body = await frameBody(baseElement, 'RegionCardEdit-afrRegionId')
    const frameDocument = body.ownerDocument
    // Side by side, 100 px wide each, since jsdom lays nothing out.
    ;[
      ['eurRegionId', 0],
      ['afrRegionId', 200]
    ].forEach(([id, left]) => {
      const card = body.querySelector(
        `[data-testid="RegionCardEdit-${id}"]`
      ) as HTMLElement
      card.getBoundingClientRect = () => ({
        top: 0,
        bottom: 100,
        left: Number(left),
        right: Number(left) + 100,
        width: 100,
        height: 100,
        x: Number(left),
        y: 0,
        toJSON: () => ({})
      })
    })
    const handle = body.querySelector(
      '[data-testid="RegionCardDragHandle-eurRegionId"]'
    )!
    expect(handle).toHaveAttribute('aria-label', 'Drag region')

    fireEvent.mouseDown(handle, { clientX: 90, clientY: 10, button: 0 })
    fireEvent.mouseMove(frameDocument, { clientX: 100, clientY: 10 })
    fireEvent.mouseMove(frameDocument, { clientX: 250, clientY: 50 })
    fireEvent.mouseUp(frameDocument, { clientX: 250, clientY: 50 })

    await waitFor(() => expect(regionOrderMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    expect(orderMock.result).not.toHaveBeenCalled()
  })

  it('renders the page inside a FramePortal iframe with the editor components', async () => {
    const { baseElement } = renderCanvas()

    const iframe = baseElement.getElementsByTagName('iframe')[0]
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('width', '1200')
    const body = await frameBody(baseElement, 'CanvasSection-heroId')
    expect(body.textContent).toContain('Share the story of Outreach')
    expect(body.textContent).toContain('Choose your region')
    expect(body.textContent).toContain('Where the story is spreading')
    // The region page's sections stay on the region page.
    expect(
      body.querySelector('[data-testid="CanvasSection-regionHeaderId"]')
    ).toBeNull()
  })

  it('renders the header above and the footer below the page’s sections, with drag handles on sections only', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(baseElement, 'CanvasSection-footerId')

    const sectionIds = Array.from(
      body.querySelectorAll('[data-testid^="CanvasSection-"]')
    ).map((section) => section.getAttribute('data-testid'))
    expect(sectionIds).toEqual([
      'CanvasSection-headerId',
      ...LANDING_SECTION_IDS.map((id) => `CanvasSection-${id}`),
      'CanvasSection-footerId'
    ])
    expect(body.textContent).toContain('Resources')
    expect(body.textContent).toContain('Terms of Use')
    expect(
      body.querySelector('[data-testid="CanvasSectionDragHandle-heroId"]')
    ).toHaveAttribute('aria-label', 'Drag section')
    expect(
      body.querySelector('[data-testid="CanvasSectionDragHandle-headerId"]')
    ).toBeNull()
    expect(
      body.querySelector('[data-testid="CanvasSectionDragHandle-footerId"]')
    ).toBeNull()
  })

  it('selects chrome on click like a section', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(baseElement, 'CanvasSection-headerId')

    fireEvent.click(
      body.querySelector('[data-testid="CanvasSection-headerId"]')!
    )

    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('chrome')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('headerId')
  })

  it('renders the Analytics section with the same campaignStats query', async () => {
    const { baseElement } = render(
      <StaticEditor mocks={[statsMock]}>
        <Canvas
          campaign={campaign}
          pageKind={CampaignPageKind.landing}
          view="desktop"
        />
      </StaticEditor>
    )
    const body = await frameBody(
      baseElement,
      'CanvasSection-landingAnalyticsId'
    )

    await waitFor(() =>
      expect(
        body.querySelector('[data-testid="CampaignAnalyticsVisitors"]')
      ).toHaveTextContent('Total visitors')
    )
    expect(statsMock.result).toHaveBeenCalledTimes(1)
    expect(
      body.querySelector('[data-testid="CampaignAnalyticsTopCountry"]')
    ).toHaveTextContent('France')
    expect(
      body.querySelector('[data-testid="CampaignAnalyticsList"]')
    ).toBeInTheDocument()
  })

  it('renders the Region Page when selected', async () => {
    const { baseElement } = renderCanvas(CampaignPageKind.regionTemplate)

    const body = await frameBody(baseElement, 'CanvasSection-regionHeaderId')
    expect(
      body.querySelector('[data-testid="CanvasSection-heroId"]')
    ).toBeNull()
  })

  it('feeds the theme’s three fonts to the FontLoader so the frame renders them', async () => {
    render(
      <StaticEditor>
        <Canvas
          campaign={{
            ...campaign,
            theme: {
              ...campaign.theme,
              headerFont: 'Oswald',
              bodyFont: 'Nunito',
              labelFont: 'Inter'
            }
          }}
          pageKind={CampaignPageKind.landing}
          view="desktop"
        />
      </StaticEditor>
    )

    await waitFor(() =>
      expect(mockWebFontLoader.load).toHaveBeenCalledWith({
        google: {
          families: [
            'Inter:400,500,600,700,800',
            'Nunito:400,500,600,700,800',
            'Oswald:400,500,600,700,800'
          ]
        }
      })
    )
  })

  it('loads no fonts while the three theme fonts are null', async () => {
    renderCanvas()

    await frameBody(document.body, 'CampaignCanvasPage')
    expect(mockWebFontLoader.load).not.toHaveBeenCalled()
  })

  it('sets the frame to 390 px in Phone view', () => {
    const { baseElement } = renderCanvas(CampaignPageKind.landing, 'phone')

    expect(baseElement.getElementsByTagName('iframe')[0]).toHaveAttribute(
      'width',
      '390'
    )
  })

  it('treats Desktop/Phone as a view toggle, not a Command', () => {
    const { baseElement } = render(<ViewHarness />)

    fireEvent.click(screen.getByRole('button', { name: 'Toggle view' }))
    expect(baseElement.getElementsByTagName('iframe')[0]).toHaveAttribute(
      'width',
      '390'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Toggle view' }))
    expect(baseElement.getElementsByTagName('iframe')[0]).toHaveAttribute(
      'width',
      '1200'
    )
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('shows the hero’s media slot beside its text, and a Featured Media section’s placeholder and bullets', async () => {
    const hero = campaign.blocks.find((block) => block.id === 'heroId')
    if (hero?.__typename !== 'CampaignHeroBlock') throw new Error('no hero')
    const heroVideo = {
      ...newOwnedVideoBlock('heroVideoId', hero, {
        source: VideoBlockSource.youTube,
        videoId: 'jQaeIJOA6J0'
      }),
      title: 'Blessing and Curse',
      image: 'https://i.ytimg.com/vi/jQaeIJOA6J0/high.jpg'
    }
    const featured = {
      ...newSectionBlock('CampaignFeaturedMediaBlock', {
        id: 'featuredId',
        campaignId: campaign.id,
        pageId: hero.pageId ?? '',
        parentOrder: 5
      }),
      bullets: 'Free to share\nIn many languages'
    }
    const { baseElement } = renderCanvas(CampaignPageKind.landing, 'desktop', {
      ...campaign,
      blocks: [
        ...campaign.blocks.map((block) =>
          block.id === 'heroId'
            ? { ...hero, mediaBlockId: 'heroVideoId' }
            : block
        ),
        heroVideo,
        featured
      ]
    })
    const body = await frameBody(baseElement, 'CanvasSection-featuredId')

    const heroSection = body.querySelector(
      '[data-testid="CanvasSection-heroId"]'
    ) as HTMLElement
    expect(
      heroSection.querySelector('[data-testid="CanvasMediaVideoPoster"]')
    ).toHaveAttribute('src', 'https://i.ytimg.com/vi/jQaeIJOA6J0/high.jpg')
    expect(heroSection.textContent).toContain('Blessing and Curse')
    expect(heroSection.textContent).toContain('Share the story of Outreach')

    const featuredSection = body.querySelector(
      '[data-testid="CanvasSection-featuredId"]'
    ) as HTMLElement
    expect(
      featuredSection.querySelector('[data-testid="CanvasMediaPlaceholder"]')
    ).not.toBeNull()
    expect(
      Array.from(
        featuredSection.querySelectorAll(
          '[data-testid="InlineText-bullets"] li'
        ),
        (item) => item.textContent
      )
    ).toEqual(['Free to share', 'In many languages'])
  })

  it('lays a stacked Featured Media section out as one column at every width, the media under the text', async () => {
    const hero = campaign.blocks.find((block) => block.id === 'heroId')
    if (hero == null) throw new Error('no hero')
    const featured = (id: string, layout: CampaignFeaturedMediaLayout) => ({
      ...newSectionBlock('CampaignFeaturedMediaBlock', {
        id,
        campaignId: campaign.id,
        pageId: hero.pageId ?? '',
        parentOrder: 5
      }),
      layout
    })
    const { baseElement } = renderCanvas(CampaignPageKind.landing, 'desktop', {
      ...campaign,
      blocks: [
        ...campaign.blocks,
        featured('stackedId', CampaignFeaturedMediaLayout.stacked),
        featured('sideBySideId', CampaignFeaturedMediaLayout.sideBySide)
      ]
    })
    const body = await frameBody(baseElement, 'CanvasSection-stackedId')
    const styles = Array.from(body.ownerDocument.querySelectorAll('style'))
      .map((node) => node.textContent ?? '')
      .join('')
    function flexRules(sectionId: string): string {
      const media = body.querySelector(
        `[data-testid="CanvasSection-${sectionId}"] [data-testid="CanvasSectionMedia"]`
      ) as HTMLElement
      expect(media.previousElementSibling).not.toBeNull()
      const className = Array.from(
        (media.parentElement as HTMLElement).classList
      ).find((name) => name.startsWith('iframe-'))
      return (
        styles.match(new RegExp(`\\.${className}\\{[^}]*\\}`, 'g')) ?? []
      ).join('')
    }

    expect(flexRules('sideBySideId')).toContain('flex-direction:row')
    expect(flexRules('stackedId')).toContain('flex-direction:column')
    expect(flexRules('stackedId')).not.toContain('flex-direction:row')
  })

  it('selects a section on click and turns its text into inline inputs', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(baseElement, 'CanvasSection-heroId')

    expect(body.querySelector('textarea')).toBeNull()
    fireEvent.click(body.querySelector('[data-testid="CanvasSection-heroId"]')!)

    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('section')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')
    await waitFor(() =>
      expect(body.querySelector('textarea[name="title"]')).toHaveValue(
        'Share the story of Outreach'
      )
    )
    expect(body.querySelector('textarea[name="eyebrow"]')).toHaveValue(
      'Outreach 2026'
    )
    expect(body.querySelector('textarea[name="description"]')).toHaveValue(
      'Pick your region to find a journey in your language, ready to share.'
    )
  })

  it('selects an Extra on click and the campaign on the empty frame', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(baseElement, 'CanvasExtra-heroButtonId')

    fireEvent.click(
      body.querySelector('[data-testid="CanvasExtra-heroButtonId"]')!
    )
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('button')
    await waitFor(() =>
      expect(body.querySelector('textarea[name="label"]')).toHaveValue(
        'Choose your region'
      )
    )

    fireEvent.click(
      body.querySelector('[data-testid="CanvasExtra-journeyListNoteId"]')!
    )
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('text')

    fireEvent.click(body.querySelector('[data-testid="CampaignCanvasPage"]')!)
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('campaign')
  })

  it('reorders a section dragged by its handle, dropping after the midpoint of the section under the pointer, as one Command', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(
      baseElement,
      'CanvasSection-landingAnalyticsId'
    )
    stackSections(body)
    const frameDocument = body.ownerDocument
    const handle = body.querySelector(
      '[data-testid="CanvasSectionDragHandle-heroId"]'
    )!

    fireEvent.mouseDown(handle, { clientX: 20, clientY: 50, button: 0 })
    // Past the activation distance, then into the lower half of the switcher.
    fireEvent.mouseMove(frameDocument, { clientX: 20, clientY: 60 })
    fireEvent.mouseMove(frameDocument, { clientX: 20, clientY: 180 })

    await waitFor(() =>
      expect(
        body.querySelector('[data-testid="CanvasDropIndicator"]')
      ).toHaveAttribute('data-edge', 'after')
    )
    expect(
      body
        .querySelector('[data-testid="CanvasDropIndicator"]')
        ?.closest('[data-testid^="CanvasSection-"]')
    ).toHaveAttribute('data-testid', 'CanvasSection-landingSwitcherId')

    fireEvent.mouseUp(frameDocument, { clientX: 20, clientY: 180 })

    await waitFor(() => expect(orderMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')
    expect(body.querySelector('[data-testid="CanvasDropIndicator"]')).toBeNull()
  })

  it('drops before the midpoint of the section under the pointer', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(
      baseElement,
      'CanvasSection-landingAnalyticsId'
    )
    stackSections(body)
    const frameDocument = body.ownerDocument
    const handle = body.querySelector(
      '[data-testid="CanvasSectionDragHandle-heroId"]'
    )!

    fireEvent.mouseDown(handle, { clientX: 20, clientY: 50, button: 0 })
    fireEvent.mouseMove(frameDocument, { clientX: 20, clientY: 60 })
    // The upper half of the carousel: before it, which is after the switcher.
    fireEvent.mouseMove(frameDocument, { clientX: 20, clientY: 220 })

    await waitFor(() =>
      expect(
        body
          .querySelector('[data-testid="CanvasDropIndicator"]')
          ?.closest('[data-testid^="CanvasSection-"]')
      ).toHaveAttribute('data-testid', 'CanvasSection-carouselId')
    )
    expect(
      body.querySelector('[data-testid="CanvasDropIndicator"]')
    ).toHaveAttribute('data-edge', 'before')

    fireEvent.mouseUp(frameDocument, { clientX: 20, clientY: 220 })

    await waitFor(() => expect(orderMock.result).toHaveBeenCalled())
  })

  it('is not draggable from the section body, only while its handle is held', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(
      baseElement,
      'CanvasSection-landingAnalyticsId'
    )
    stackSections(body)
    const frameDocument = body.ownerDocument
    const section = body.querySelector('[data-testid="CanvasSection-heroId"]')!

    fireEvent.mouseDown(section, { clientX: 400, clientY: 50, button: 0 })
    fireEvent.mouseMove(frameDocument, { clientX: 400, clientY: 60 })
    fireEvent.mouseMove(frameDocument, { clientX: 400, clientY: 180 })
    fireEvent.mouseUp(frameDocument, { clientX: 400, clientY: 180 })

    expect(body.querySelector('[data-testid="CanvasDropIndicator"]')).toBeNull()
    expect(orderMock.result).not.toHaveBeenCalled()
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  describe('Columns', () => {
    function renderColumnsCanvas(): ReturnType<typeof render> {
      return render(
        <StaticEditor campaignProp={campaignWithColumns} mocks={[swapMock]}>
          <SelectionProbe />
          <CommandProbe />
          <Canvas
            campaign={campaignWithColumns}
            pageKind={CampaignPageKind.landing}
            view="desktop"
          />
        </StaticEditor>
      )
    }

    /** Lay the two slots side by side, 400 px wide each, since jsdom lays nothing out. */
    function placeSlots(body: HTMLElement): void {
      ;['slotLeftId', 'slotRightId'].forEach((id, index) => {
        const slot = body.querySelector(
          `[data-testid="CanvasColumnSlot-${id}"]`
        ) as HTMLElement
        const left = index * 400
        slot.getBoundingClientRect = () => ({
          top: 0,
          bottom: 100,
          left,
          right: left + 400,
          width: 400,
          height: 100,
          x: left,
          y: 0,
          toJSON: () => ({})
        })
      })
    }

    it('renders the two slots, the section one holds and a placeholder for the empty one', async () => {
      const { baseElement } = renderColumnsCanvas()
      const body = await frameBody(baseElement, 'CanvasColumns-columnsId')

      const left = body.querySelector(
        '[data-testid="CanvasColumnSlot-slotLeftId"]'
      )!
      const right = body.querySelector(
        '[data-testid="CanvasColumnSlot-slotRightId"]'
      )!
      expect(
        left.querySelector('[data-testid="CanvasSection-slotRichTextId"]')
      ).not.toBeNull()
      expect(left.textContent).toContain('Our story')
      expect(left.textContent).toContain('First.')
      expect(
        right.querySelector('[data-testid="CanvasEmptyColumn-slotRightId"]')
      ).not.toBeNull()
      // Only a page section has a drag handle; each slot has its own.
      expect(
        body.querySelector('[data-testid="CanvasSectionDragHandle-columnsId"]')
      ).not.toBeNull()
      expect(
        body.querySelector(
          '[data-testid="CanvasSectionDragHandle-slotRichTextId"]'
        )
      ).toBeNull()
      expect(
        body.querySelector('[data-testid="CanvasColumnDragHandle-slotLeftId"]')
      ).toHaveAttribute('aria-label', 'Drag column')
    })

    it('selects an empty slot, the section in a slot and the Columns section on click', async () => {
      const { baseElement } = renderColumnsCanvas()
      const body = await frameBody(baseElement, 'CanvasColumns-columnsId')

      fireEvent.click(
        body.querySelector('[data-testid="CanvasColumnSlot-slotRightId"]')!
      )
      expect(screen.getByTestId('SelectionKind')).toHaveTextContent('slot')
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'slotRightId'
      )

      fireEvent.click(
        body.querySelector('[data-testid="CanvasSection-slotRichTextId"]')!
      )
      expect(screen.getByTestId('SelectionKind')).toHaveTextContent('column')
      await waitFor(() =>
        expect(body.querySelector('textarea[name="title"]')).toHaveValue(
          'Our story'
        )
      )
      expect(
        body.querySelector('textarea[name="richTextContent"]')
      ).toHaveValue('First.\n\nSecond.')

      fireEvent.click(
        body.querySelector('[data-testid="CanvasSection-columnsId"]')!
      )
      expect(screen.getByTestId('SelectionKind')).toHaveTextContent('section')
    })

    it('swaps the slots when one is dragged by its handle onto the other, as one Command', async () => {
      const { baseElement } = renderColumnsCanvas()
      const body = await frameBody(baseElement, 'CanvasColumns-columnsId')
      placeSlots(body)
      const frameDocument = body.ownerDocument
      const handle = body.querySelector(
        '[data-testid="CanvasColumnDragHandle-slotLeftId"]'
      )!

      fireEvent.mouseDown(handle, { clientX: 20, clientY: 50, button: 0 })
      fireEvent.mouseMove(frameDocument, { clientX: 40, clientY: 50 })
      fireEvent.mouseMove(frameDocument, { clientX: 600, clientY: 50 })
      fireEvent.mouseUp(frameDocument, { clientX: 600, clientY: 50 })

      await waitFor(() => expect(swapMock.result).toHaveBeenCalled())
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
      // The slot's section stays selected through the swap.
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'slotRichTextId'
      )
    })

    it('does nothing when a slot is dropped back on itself', async () => {
      const { baseElement } = renderColumnsCanvas()
      const body = await frameBody(baseElement, 'CanvasColumns-columnsId')
      placeSlots(body)
      const frameDocument = body.ownerDocument
      const handle = body.querySelector(
        '[data-testid="CanvasColumnDragHandle-slotLeftId"]'
      )!

      fireEvent.mouseDown(handle, { clientX: 20, clientY: 50, button: 0 })
      fireEvent.mouseMove(frameDocument, { clientX: 40, clientY: 50 })
      fireEvent.mouseMove(frameDocument, { clientX: 100, clientY: 50 })
      fireEvent.mouseUp(frameDocument, { clientX: 100, clientY: 50 })

      expect(swapMock.result).not.toHaveBeenCalled()
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
    })
  })
})

describe('Canvas scaled to fit', () => {
  /** The size the stage reports to the canvas's ResizeObserver. */
  const stage = { width: 900, height: 600 }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('offline')))
    )
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private readonly callback: ResizeObserverCallback) {}

        observe(): void {
          this.callback([{ contentRect: stage } as ResizeObserverEntry], this)
        }

        disconnect = vi.fn()
        unobserve = vi.fn()
      }
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    stage.width = 900
  })

  it('keeps the Desktop frame 1200 px wide and scales a wrapper outside it to the stage', async () => {
    const { baseElement } = renderCanvas()
    await frameBody(baseElement, 'CanvasSection-heroId')

    const wrapper = screen.getByTestId('CampaignCanvasScale')
    expect(wrapper).toHaveAttribute('data-scale', String(900 / 1200))
    expect(wrapper).toHaveStyle({ width: '900px' })
    const iframe = baseElement.getElementsByTagName('iframe')[0]
    expect(iframe).toHaveAttribute('width', '1200')
    const scaled = iframe.parentElement as HTMLElement
    expect(scaled).toHaveStyle({
      width: '1200px',
      transform: `scale(${900 / 1200})`,
      transformOrigin: 'top left'
    })
    expect(scaled).toHaveStyle({ height: '800px' })
  })

  it('never scales below 0.5', async () => {
    stage.width = 400
    const { baseElement } = renderCanvas()
    await frameBody(baseElement, 'CanvasSection-heroId')

    expect(screen.getByTestId('CampaignCanvasScale')).toHaveAttribute(
      'data-scale',
      '0.5'
    )
    expect(screen.getByTestId('CampaignCanvasScale')).toHaveStyle({
      width: '600px'
    })
  })

  it('does not enlarge the frame on a wide stage, and leaves the Phone frame at 390 px', async () => {
    stage.width = 1472
    const { baseElement } = renderCanvas(CampaignPageKind.landing, 'phone')
    await frameBody(baseElement, 'CanvasSection-heroId')

    expect(screen.getByTestId('CampaignCanvasScale')).toHaveAttribute(
      'data-scale',
      '1'
    )
    expect(screen.getByTestId('CampaignCanvasScale')).toHaveStyle({
      width: '390px'
    })
    expect(baseElement.getElementsByTagName('iframe')[0]).toHaveAttribute(
      'width',
      '390'
    )
  })

  it('still reorders a section dragged by its handle, by the midpoint of the section under the pointer', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(
      baseElement,
      'CanvasSection-landingAnalyticsId'
    )
    stackSections(body)
    const frameDocument = body.ownerDocument
    const handle = body.querySelector(
      '[data-testid="CanvasSectionDragHandle-heroId"]'
    )!

    fireEvent.mouseDown(handle, { clientX: 20, clientY: 50, button: 0 })
    fireEvent.mouseMove(frameDocument, { clientX: 20, clientY: 60 })
    fireEvent.mouseMove(frameDocument, { clientX: 20, clientY: 180 })

    await waitFor(() =>
      expect(
        body.querySelector('[data-testid="CanvasDropIndicator"]')
      ).toHaveAttribute('data-edge', 'after')
    )
    fireEvent.mouseUp(frameDocument, { clientX: 20, clientY: 180 })

    await waitFor(() => expect(orderMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('still swaps the slots of a Columns section', async () => {
    const { baseElement } = render(
      <StaticEditor campaignProp={campaignWithColumns} mocks={[swapMock]}>
        <CommandProbe />
        <Canvas
          campaign={campaignWithColumns}
          pageKind={CampaignPageKind.landing}
          view="desktop"
        />
      </StaticEditor>
    )
    const body = await frameBody(baseElement, 'CanvasColumns-columnsId')
    ;['slotLeftId', 'slotRightId'].forEach((id, index) => {
      const slot = body.querySelector(
        `[data-testid="CanvasColumnSlot-${id}"]`
      ) as HTMLElement
      const left = index * 400
      slot.getBoundingClientRect = () => ({
        top: 0,
        bottom: 100,
        left,
        right: left + 400,
        width: 400,
        height: 100,
        x: left,
        y: 0,
        toJSON: () => ({})
      })
    })
    const frameDocument = body.ownerDocument
    const handle = body.querySelector(
      '[data-testid="CanvasColumnDragHandle-slotLeftId"]'
    )!

    fireEvent.mouseDown(handle, { clientX: 20, clientY: 50, button: 0 })
    fireEvent.mouseMove(frameDocument, { clientX: 40, clientY: 50 })
    fireEvent.mouseMove(frameDocument, { clientX: 600, clientY: 50 })
    fireEvent.mouseUp(frameDocument, { clientX: 600, clientY: 50 })

    await waitFor(() => expect(swapMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('edits text inline with its character counter', async () => {
    const { baseElement } = renderCanvas()
    const body = await frameBody(baseElement, 'CanvasSection-heroId')
    fireEvent.click(body.querySelector('[data-testid="CanvasSection-heroId"]')!)
    const title = await waitFor(() => {
      const input = body.querySelector('textarea[name="title"]')
      expect(input).not.toBeNull()
      return input as HTMLTextAreaElement
    })

    fireEvent.change(title, { target: { value: 'x'.repeat(130) } })

    await waitFor(() => expect(body.textContent).toContain('130 / 150'))
  })

  it('focuses an inline input without scrolling the editor page', async () => {
    const { baseElement } = render(
      <StaticEditor mocks={[orderMock]}>
        <Canvas
          campaign={campaign}
          pageKind={CampaignPageKind.landing}
          view="desktop"
        />
      </StaticEditor>
    )
    const body = await frameBody(baseElement, 'CanvasExtra-heroButtonId')
    // The input lives in the frame's window, which has its own HTMLElement.
    const frameWindow = body.ownerDocument.defaultView as Window &
      typeof globalThis
    const focus = vi.spyOn(frameWindow.HTMLElement.prototype, 'focus')

    fireEvent.click(
      body.querySelector('[data-testid="CanvasExtra-heroButtonId"]')!
    )

    await waitFor(() => expect(focus).toHaveBeenCalled())
    expect(
      focus.mock.calls.every(([options]) => options?.preventScroll === true)
    ).toBe(true)
    focus.mockRestore()
  })
})

describe('Canvas preview language', () => {
  const translated: typeof campaign = {
    ...campaign,
    blocks: campaign.blocks.map((block) =>
      block.__typename === 'CampaignHeroBlock'
        ? {
            ...block,
            titleTranslations: [
              {
                __typename: 'TranslatedValue',
                languageId: '496',
                value: "Partagez l'histoire de Campagne",
                source: CampaignTextSource.human
              }
            ]
          }
        : block
    )
  }

  it('renders the campaign text in the preview language the Pages panel chose, falling back to the default where no translation exists', async () => {
    const { baseElement } = render(
      <StaticEditor
        campaignProp={translated}
        initialState={{ previewLanguageId: '496' }}
      >
        <Canvas
          campaign={translated}
          pageKind={CampaignPageKind.landing}
          view="desktop"
        />
      </StaticEditor>
    )

    const body = await frameBody(baseElement, 'CanvasSection-heroId')
    const hero = body.querySelector('[data-testid="CanvasSection-heroId"]')
    expect(hero?.textContent).toContain("Partagez l'histoire de Campagne")
    expect(hero?.textContent).not.toContain('Share the story of Outreach')
    // The untranslated eyebrow shows the default-language fallback, marked.
    const eyebrow = hero?.querySelector('[data-testid="InlineText-eyebrow"]')
    expect(eyebrow).toHaveTextContent('Outreach 2026')
    expect(eyebrow).toHaveAttribute('data-fallback', 'true')
  })

  it('sets the frame direction from the preview language', async () => {
    const arabic: typeof campaign = {
      ...campaign,
      languages: [
        ...campaign.languages,
        {
          __typename: 'CampaignLanguage',
          id: 'campaignLanguageArId',
          languageId: '22658',
          order: 2,
          language: {
            __typename: 'Language',
            id: '22658',
            bcp47: 'ar',
            name: [
              { __typename: 'LanguageName', value: 'العربية', primary: true }
            ]
          }
        }
      ]
    }
    const { baseElement } = render(
      <StaticEditor
        campaignProp={arabic}
        initialState={{ previewLanguageId: '22658' }}
      >
        <Canvas
          campaign={arabic}
          pageKind={CampaignPageKind.landing}
          view="desktop"
        />
      </StaticEditor>
    )
    await frameBody(baseElement, 'CanvasSection-heroId')
    const iframe = baseElement.getElementsByTagName('iframe')[0]
    expect(iframe.contentDocument?.documentElement).toHaveAttribute(
      'dir',
      'rtl'
    )
  })
})
