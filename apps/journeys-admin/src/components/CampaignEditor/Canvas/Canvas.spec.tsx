import Button from '@mui/material/Button'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement, useState } from 'react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { CAMPAIGN_BLOCK_ORDER_UPDATE } from '../../../libs/useCampaignBlockOrderUpdateMutation'
import { campaign, campaignWithColumns } from '../data'
import {
  CommandProbe,
  SelectionProbe,
  StaticEditor,
  frameBody
} from '../testing'

import { Canvas, dropEdgeFor, dropParentOrder } from './Canvas'
import type { CanvasView } from './Canvas'

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
        previewLanguageId="529"
        view={view}
      />
    </StaticEditor>
  )
}

function renderCanvas(
  pageKind = CampaignPageKind.landing,
  view: CanvasView = 'desktop'
): ReturnType<typeof render> {
  return render(
    <StaticEditor mocks={[orderMock]}>
      <SelectionProbe />
      <CommandProbe />
      <Canvas
        campaign={campaign}
        pageKind={pageKind}
        previewLanguageId="529"
        view={view}
      />
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
  beforeEach(() => vi.clearAllMocks())

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

  it('renders the page inside a FramePortal iframe with the editor components', async () => {
    const { baseElement } = renderCanvas()

    const iframe = baseElement.getElementsByTagName('iframe')[0]
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('width', '100%')
    const body = await frameBody(baseElement, 'CanvasSection-heroId')
    expect(body.textContent).toContain('Share the story of Christmas')
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

  it('renders the Region Page when selected', async () => {
    const { baseElement } = renderCanvas(CampaignPageKind.regionTemplate)

    const body = await frameBody(baseElement, 'CanvasSection-regionHeaderId')
    expect(
      body.querySelector('[data-testid="CanvasSection-heroId"]')
    ).toBeNull()
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
      '100%'
    )
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
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
        'Share the story of Christmas'
      )
    )
    expect(body.querySelector('textarea[name="eyebrow"]')).toHaveValue(
      'Christmas 2026'
    )
    expect(body.querySelector('textarea[name="lede"]')).toHaveValue(
      'Pick your region to find a journey in your language, ready to share.'
    )
  })

  it('selects an Extra on click and the campaign row on the empty frame', async () => {
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
            previewLanguageId="529"
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
