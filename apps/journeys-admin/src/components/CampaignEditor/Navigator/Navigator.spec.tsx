import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { Profiler, ReactElement } from 'react'

import { GET_CAMPAIGN_STATS } from '@core/journeys/ui/Campaign'
import { campaignStatsFixture } from '@core/journeys/ui/Campaign/testData'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { Canvas } from '../Canvas'
import { campaign, campaignWithColumns, campaignWithRegions } from '../data'
import { Hotkeys } from '../Hotkeys'
import { SelectionProbe, StaticEditor, frameBody } from '../testing'

import { Navigator } from './Navigator'
import { NavigatorHoverProvider } from './NavigatorHover'

const statsMock = {
  request: { query: GET_CAMPAIGN_STATS, variables: { id: campaign.id } },
  result: { data: { campaignStats: campaignStatsFixture } }
}

const mockWebFontLoader = { load: vi.fn() }

vi.mock('webfontloader', () => mockWebFontLoader)

function PanelProbe(): ReactElement {
  const {
    state: { panel }
  } = useCampaignEditor()
  return <span data-testid="Panel">{panel}</span>
}

function SelectOnCanvas({ blockId }: { blockId: string }): ReactElement {
  const { selectBlock } = useCampaignEditor()
  return <button onClick={() => selectBlock(blockId)}>select on canvas</button>
}

interface RenderNavigatorProps {
  campaignProp?: typeof campaign
  initialState?: Record<string, unknown>
  withCanvas?: boolean
  onCanvasRender?: () => void
  children?: ReactElement
}

function renderNavigator({
  campaignProp = campaign,
  initialState,
  withCanvas = false,
  onCanvasRender,
  children
}: RenderNavigatorProps = {}): ReturnType<typeof render> {
  return render(
    <StaticEditor
      campaignProp={campaignProp}
      initialState={initialState}
      mocks={[statsMock, statsMock, statsMock]}
    >
      <NavigatorHoverProvider>
        <Hotkeys />
        <SelectionProbe />
        <PanelProbe />
        {children}
        <Navigator />
        {withCanvas && (
          <Profiler id="canvas" onRender={() => onCanvasRender?.()}>
            <Canvas
              campaign={campaignProp}
              pageKind={
                initialState?.pageKind === CampaignPageKind.regionTemplate
                  ? CampaignPageKind.regionTemplate
                  : CampaignPageKind.landing
              }
              view="desktop"
            />
          </Profiler>
        )}
      </NavigatorHoverProvider>
    </StaticEditor>
  )
}

function row(id: string): HTMLElement {
  return screen.getByTestId(`NavigatorRow-${id}`)
}

function queryRow(id: string): HTMLElement | null {
  return screen.queryByTestId(`NavigatorRow-${id}`)
}

function content(item: HTMLElement): HTMLElement {
  return item.querySelector('.MuiTreeItem-content') as HTMLElement
}

describe('Navigator', () => {
  it('lists the landing page: header, sections in order, footer, with the type name and the title as secondary text', () => {
    renderNavigator()

    expect(screen.getAllByRole('treeitem')).toHaveLength(7)
    expect(row('headerId')).toBeInTheDocument()
    expect(row('heroId')).toHaveTextContent(/Hero.+\S/)
    expect(row('landingSwitcherId')).toBeInTheDocument()
    expect(row('carouselId')).toBeInTheDocument()
    expect(row('landingJourneyListId')).toBeInTheDocument()
    expect(row('landingAnalyticsId')).toBeInTheDocument()
    expect(row('footerId')).toBeInTheDocument()
  })

  it('shows a Region Page’s sections for the region being rendered', () => {
    renderNavigator({
      campaignProp: campaignWithRegions,
      initialState: {
        pageKind: CampaignPageKind.regionTemplate,
        regionId: 'eurRegionId'
      }
    })

    expect(row('regionHeaderId')).toBeInTheDocument()
    expect(row('regionShareId')).toBeInTheDocument()
    expect(queryRow('heroId')).toBeNull()
  })

  it('collapses the children by default', () => {
    renderNavigator()

    expect(row('heroId')).toHaveAttribute('aria-expanded', 'false')
    expect(queryRow('heroButtonId')).toBeNull()
  })

  it('shows region cards with the Needs journey badge and the unlisted eye-slash, and their lines', () => {
    renderNavigator({
      campaignProp: campaignWithRegions,
      initialState: { selectedBlockId: 'eurLineId' }
    })

    const europe = row('landingSwitcherId__eurRegionId')
    expect(
      within(europe).getAllByTestId('NavigatorNeedsJourney')[0]
    ).toHaveTextContent('Needs journey')
    expect(within(europe).queryByTestId('NavigatorUnlisted')).toBeNull()
    const africa = row('landingSwitcherId__afrRegionId')
    expect(within(africa).getByTestId('NavigatorUnlisted')).toBeInTheDocument()
    expect(
      within(africa).getByTestId('NavigatorNeedsJourney')
    ).toBeInTheDocument()
    expect(row('landingSwitcherId__eurRegionId__eurLineId')).toBeInTheDocument()
  })

  it('tags an Extra above or below its section', () => {
    renderNavigator({ initialState: { selectedBlockId: 'heroButtonId' } })

    expect(
      within(row('heroButtonId')).getByTestId('NavigatorPlacement')
    ).toHaveTextContent(/^(Above|Below)$/)
  })

  describe('selection', () => {
    it('selects the block on click and scrolls the canvas element into view', async () => {
      const { baseElement } = renderNavigator({ withCanvas: true })
      const body = await frameBody(baseElement, 'CanvasSection-heroId')
      const scrollIntoView = vi.fn()
      ;(body.querySelector('#heroId') as HTMLElement).scrollIntoView =
        scrollIntoView

      fireEvent.click(content(row('heroId')))

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
    })

    it('selects a region card with its switcher', () => {
      renderNavigator({
        campaignProp: campaignWithRegions,
        initialState: { selectedBlockId: 'eurLineId' }
      })

      fireEvent.click(content(row('landingSwitcherId__afrRegionId')))

      expect(screen.getByTestId('SelectionKind')).toHaveTextContent('region')
      expect(screen.getByTestId('SelectedRegionId')).toHaveTextContent(
        'afrRegionId'
      )
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'landingSwitcherId'
      )
    })

    it('does not select when a row is expanded with its arrow', () => {
      renderNavigator()

      fireEvent.click(
        row('landingJourneyListId').querySelector(
          '.MuiTreeItem-iconContainer'
        ) as HTMLElement
      )

      expect(row('landingJourneyListId')).toHaveAttribute(
        'aria-expanded',
        'true'
      )
      expect(screen.getByTestId('SelectedBlockId')).toBeEmptyDOMElement()
    })

    it('moves focus with the arrow keys without selecting', () => {
      renderNavigator()
      const items = screen.getAllByRole('treeitem')
      act(() => items[0].focus())

      fireEvent.keyDown(items[0], { key: 'ArrowDown' })

      expect(items[1]).toHaveFocus()
      expect(screen.getByTestId('SelectedBlockId')).toBeEmptyDOMElement()
    })

    it.each([['Enter'], [' ']])('selects the focused row on %j', (key) => {
      renderNavigator()
      const hero = row('heroId')
      act(() => hero.focus())

      fireEvent.keyDown(hero, { key })

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')
    })
  })

  describe('expansion', () => {
    it('expands the ancestors of the selection, including one made on the canvas', () => {
      renderNavigator({
        campaignProp: campaignWithColumns,
        children: <SelectOnCanvas blockId="slotRichTextId" />
      })
      expect(queryRow('slotRichTextId')).toBeNull()

      fireEvent.click(screen.getByText('select on canvas'))

      expect(row('columnsId')).toHaveAttribute('aria-expanded', 'true')
      expect(row('slotRichTextId')).toBeInTheDocument()
      expect(content(row('slotRichTextId'))).toHaveAttribute('data-selected')
    })

    it('expands every row on Option+Z and collapses them on the next', () => {
      renderNavigator({ campaignProp: campaignWithColumns })

      fireEvent.keyDown(document, { key: 'Ω', code: 'KeyZ', altKey: true })
      expect(row('slotRichTextId')).toBeInTheDocument()
      expect(row('columnsId')).toHaveAttribute('aria-expanded', 'true')

      const optionZ = { key: 'Ω', code: 'KeyZ', altKey: true }
      fireEvent.keyUp(document, optionZ)
      fireEvent.keyDown(document, optionZ)
      expect(row('columnsId')).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('hotkeys', () => {
    it('toggles the Navigator panel on Z', () => {
      renderNavigator()

      fireEvent.keyDown(document, { key: 'z', code: 'KeyZ' })
      expect(screen.getByTestId('Panel')).toHaveTextContent('navigator')

      fireEvent.keyDown(document, { key: 'z', code: 'KeyZ' })
      expect(screen.getByTestId('Panel')).toHaveTextContent('none')
    })

    it('ignores Z and Option+Z inside an input', () => {
      renderNavigator({
        campaignProp: campaignWithColumns,
        children: <input aria-label="field" />
      })
      const input = screen.getByLabelText('field')

      fireEvent.keyDown(input, { key: 'z', code: 'KeyZ' })
      fireEvent.keyDown(input, { key: 'Ω', code: 'KeyZ', altKey: true })

      expect(screen.getByTestId('Panel')).toHaveTextContent('none')
      expect(queryRow('slotRichTextId')).toBeNull()
    })
  })

  describe('hover', () => {
    it('sets data-hovered on the canvas element while a row is hovered', async () => {
      const { baseElement } = renderNavigator({ withCanvas: true })
      const body = await frameBody(baseElement, 'CanvasSection-heroId')
      const hero = body.querySelector('#heroId') as HTMLElement

      fireEvent.mouseEnter(content(row('heroId')))
      expect(hero).toHaveAttribute('data-hovered')

      fireEvent.mouseLeave(content(row('heroId')))
      expect(hero).not.toHaveAttribute('data-hovered')
    })

    it('highlights a row while its canvas element is hovered', async () => {
      const { baseElement } = renderNavigator({ withCanvas: true })
      const body = await frameBody(baseElement, 'CanvasSection-heroId')

      fireEvent.mouseOver(body.querySelector('#heroId') as HTMLElement)
      expect(row('heroId')).toHaveAttribute('data-canvas-hovered')
      expect(row('footerId')).not.toHaveAttribute('data-canvas-hovered')

      fireEvent.mouseOver(
        body.querySelector('#landingSwitcherId') as HTMLElement
      )
      expect(row('heroId')).not.toHaveAttribute('data-canvas-hovered')
      expect(row('landingSwitcherId')).toHaveAttribute('data-canvas-hovered')
    })

    it('does not re-render the canvas on hover, either way', async () => {
      const onCanvasRender = vi.fn()
      const { baseElement } = renderNavigator({
        withCanvas: true,
        onCanvasRender
      })
      const body = await frameBody(baseElement, 'CanvasSection-heroId')
      const hero = body.querySelector('#heroId') as HTMLElement
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })
      onCanvasRender.mockClear()

      fireEvent.mouseOver(hero)
      fireEvent.mouseEnter(content(row('footerId')))
      fireEvent.mouseLeave(content(row('footerId')))
      fireEvent.mouseOver(
        body.querySelector('#landingSwitcherId') as HTMLElement
      )

      expect(onCanvasRender).not.toHaveBeenCalled()
    })
  })
})
