import {
  ClientRect,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { useTranslation } from 'next-i18next/pages'
import {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  createCampaignTheme,
  transformCampaignBlocks
} from '@core/journeys/ui/Campaign'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { getLocaleRTL } from '@core/shared/ui/rtl'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { FontLoader } from '../../Editor/FontLoader'
import { sortedRegions, useCampaignEditor } from '../CampaignEditorProvider'
import { Hotkeys } from '../Hotkeys'
import { CanvasHoverReporter } from '../Navigator/NavigatorHover'
import { PreviewLanguageChip } from '../PreviewLanguageChip'
import { slotSection } from '../sectionTypes'
import { useCampaignBlockOrderCommand } from '../utils/useCampaignBlockOrderCommand'
import { useCampaignRegionCommand } from '../utils/useCampaignRegionCommand'
import { useColumnSwapCommand } from '../utils/useColumnSwapCommand'

import { CanvasInsertPoint } from './CanvasInsertPoint'
import { CanvasView, canvasScale, frameWidthOf } from './canvasScale'
import { CanvasSection } from './CanvasSection'
import { FrameTheme } from './FrameTheme'

export { PHONE_FRAME_WIDTH } from './canvasScale'

/** The frame's corner radius in theme radius units (`borderRadius: 3`). */
const FRAME_RADIUS = 3
export type { CanvasView } from './canvasScale'

export type DropEdge = 'before' | 'after'

export interface DropTarget {
  /** The section under the pointer. */
  overId: string
  edge: DropEdge
}

/** Which side of the section under the pointer a drop lands on: its midpoint decides. */
export function dropEdgeFor(
  pointerY: number,
  rect: { top: number; height: number }
): DropEdge {
  return pointerY < rect.top + rect.height / 2 ? 'before' : 'after'
}

/**
 * The `parentOrder` a drop produces among the page's sections (in order), or
 * undefined when the section would land where it already is.
 */
export function dropParentOrder(
  sectionIds: string[],
  activeId: string,
  target: DropTarget
): number | undefined {
  const from = sectionIds.indexOf(activeId)
  const overIndex = sectionIds.indexOf(target.overId)
  if (from < 0 || overIndex < 0) return undefined
  let to = target.edge === 'before' ? overIndex : overIndex + 1
  if (from < to) to -= 1
  return to === from ? undefined : to
}

/** The drag data a Column Slot carries, set by `CanvasColumnSlot`, or a region card, set by `RegionCardEdit`. */
interface SlotDragData {
  slot?: boolean
  columnsId?: string | null
  /** A region card: it only trades places with the other cards of the campaign. */
  regionId?: string
}

function slotDataOf(
  data: { current?: SlotDragData } | undefined
): SlotDragData {
  return data?.current ?? {}
}

/**
 * The `order` a region card dropped on another card takes: the target's
 * place among the campaign's regions in order, or undefined for a drop on
 * itself or on nothing.
 */
export function regionDropOrder(
  regionIds: string[],
  activeRegionId: string,
  overRegionId: string | undefined
): number | undefined {
  if (overRegionId == null || overRegionId === activeRegionId) return undefined
  const to = regionIds.indexOf(overRegionId)
  return to < 0 || regionIds.indexOf(activeRegionId) < 0 ? undefined : to
}

/**
 * The section under the pointer, falling back to the nearest centre at the
 * page's edges. A section only collides with sections; a Column Slot only
 * with the other slot of its own Columns section; a region card only with
 * the other region cards.
 */
const collisionDetection: CollisionDetection = (args) => {
  const active = slotDataOf(args.active?.data)
  const droppableContainers = args.droppableContainers.filter((container) => {
    const candidate = slotDataOf(container.data)
    if (active.regionId != null) return candidate.regionId != null
    if (candidate.regionId != null) return false
    if (active.slot !== true) return candidate.slot !== true
    return candidate.slot === true && candidate.columnsId === active.columnsId
  })
  const scoped = { ...args, droppableContainers }
  const within = pointerWithin(scoped)
  return within.length > 0 ? within : closestCenter(scoped)
}

function pointerYOf(event: DragMoveEvent | DragEndEvent): number | undefined {
  const activator = event.activatorEvent as Partial<MouseEvent> &
    Partial<TouchEvent>
  const start = activator.clientY ?? activator.touches?.[0]?.clientY
  return start == null ? undefined : start + event.delta.y
}

/**
 * The section under the pointer and the side of it the drop lands on. Read
 * from the first collision rather than `over`, which lags a render behind.
 */
function dropTargetOf(
  event: DragMoveEvent | DragEndEvent
): DropTarget | undefined {
  const collision = event.collisions?.[0]
  const rect: ClientRect | null | undefined =
    collision?.data?.droppableContainer?.rect?.current
  const pointerY = pointerYOf(event)
  if (
    collision == null ||
    rect == null ||
    pointerY == null ||
    collision.id === event.active.id
  )
    return undefined
  return { overId: String(collision.id), edge: dropEdgeFor(pointerY, rect) }
}

/** Publishes the frame's document to the editor provider while the frame is mounted. */
function FrameDocument({ document }: { document: Document }): ReactElement {
  const { frameDocumentRef } = useCampaignEditor()
  useEffect(() => {
    frameDocumentRef.current = document
    return () => {
      frameDocumentRef.current = null
    }
  }, [document, frameDocumentRef])
  return <></>
}

interface StageSize {
  width: number
  height: number
}

/**
 * The size of the space the frame may fill, measured on a callback ref. It
 * stays undefined until measured (and where there is no ResizeObserver, as in
 * jsdom), when the frame is shown unscaled.
 */
function useStageSize(): [(node: HTMLElement | null) => void, StageSize?] {
  const [stage, setStage] = useState<HTMLElement | null>(null)
  const [size, setSize] = useState<StageSize>()
  const ref = useCallback((node: HTMLElement | null) => setStage(node), [])

  useEffect(() => {
    if (stage == null || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [stage])

  return [ref, size]
}

interface CanvasProps {
  campaign: Campaign
  pageKind: CampaignPageKind
  view: CanvasView
}

/**
 * The campaign canvas: the chosen page rendered inside a FramePortal iframe
 * with the editor's own section components under the campaign's theme, in
 * the Preview Language the Pages panel chose (its text direction follows that
 * language's bcp47), the header above and the footer below as on the public
 * page. Desktop/Phone is a view toggle held by the shell, never a Command.
 * The frame carries its own Hotkeys, since its key events never leave it, and
 * a click on the empty frame returns to the campaign. A section is
 * dragged by its handle only; the drop lands before or after the section
 * under the pointer by its midpoint, as one reorder Command. A "+" between
 * sections (and above the first, below the last) opens the Add Panel at that
 * insert point. The Preview Language chip sits at the canvas's bottom-right,
 * outside the frame, in the editor theme.
 *
 * The frame has a fixed width (1200 px Desktop, 390 px Phone) and is scaled
 * down to fit the space it is given with a CSS transform on a wrapper outside
 * the frame, never below 0.5. Everything that runs inside the frame stays
 * inside it, so the scale never reaches it: the pointer coordinates and rects
 * the drag context reads all come from the frame's own unscaled document.
 */
export function Canvas({
  campaign,
  pageKind,
  view
}: CanvasProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    selectBlock,
    state: { previewLanguageId }
  } = useCampaignEditor()
  const { addBlockOrder } = useCampaignBlockOrderCommand()
  const { addColumnSwap } = useColumnSwapCommand()
  const { reorderRegion } = useCampaignRegionCommand()
  const [dropTarget, setDropTarget] = useState<DropTarget>()
  const page = campaign.pages.find((candidate) => candidate.kind === pageKind)
  const pageId = page?.id
  const sections = useMemo(
    () =>
      transformCampaignBlocks(
        campaign.blocks.filter((block) => block.pageId === pageId)
      ),
    [campaign.blocks, pageId]
  )
  const chrome = useMemo(
    () =>
      transformCampaignBlocks(
        campaign.blocks.filter(
          (block) => block.pageId == null && block.regionId == null
        )
      ),
    [campaign.blocks]
  )
  const header = chrome.find(
    (block) => block.__typename === 'CampaignHeaderBlock'
  )
  const footer = chrome.find(
    (block) => block.__typename === 'CampaignFooterBlock'
  )
  const language = campaign.languages.find(
    (candidate) => candidate.languageId === previewLanguageId
  )
  const rtl = getLocaleRTL(language?.language.bcp47 ?? '')
  const theme = useMemo(
    () => createCampaignTheme(campaign.theme, rtl),
    [campaign.theme, rtl]
  )
  const fontFamilies = useMemo(
    () => ({
      headerFont: campaign.theme.headerFont ?? '',
      bodyFont: campaign.theme.bodyFont ?? '',
      labelFont: campaign.theme.labelFont ?? ''
    }),
    [campaign.theme]
  )
  const fonts = useMemo(
    () => [
      fontFamilies.headerFont,
      fontFamilies.bodyFont,
      fontFamilies.labelFont
    ],
    [fontFamilies]
  )
  const [stageRef, stageSize] = useStageSize()
  const frameWidth = frameWidthOf(view)
  const scale = stageSize == null ? 1 : canvasScale(stageSize.width, frameWidth)
  const frameHeight = stageSize == null ? '100%' : stageSize.height / scale
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 }
    })
  )

  function handleDragMove(event: DragMoveEvent): void {
    const active = slotDataOf(event.active.data)
    if (active.slot === true || active.regionId != null) return
    setDropTarget(dropTargetOf(event))
  }

  /** A region card dropped on another card takes that card's place; the cards between shift. */
  function handleRegionDragEnd(event: DragEndEvent): void {
    const activeRegionId = slotDataOf(event.active.data).regionId
    const overRegionId = slotDataOf(
      event.collisions?.[0]?.data?.droppableContainer?.data
    ).regionId
    if (activeRegionId == null) return
    const regions = sortedRegions(campaign.regions)
    const order = regionDropOrder(
      regions.map((region) => region.id),
      activeRegionId,
      overRegionId
    )
    const region = regions.find((candidate) => candidate.id === activeRegionId)
    if (order == null || region == null) return
    reorderRegion(region, order)
  }

  /** A slot dropped on the other slot of its Columns section swaps the two. */
  function handleSlotDragEnd(event: DragEndEvent): void {
    const overId = event.collisions?.[0]?.id
    if (overId == null || overId === event.active.id) return
    const slot = campaign.blocks.find(
      (candidate) => candidate.id === String(event.active.id)
    )
    if (slot == null) return
    addColumnSwap(slot, slotSection(campaign.blocks, slot.id)?.id)
  }

  function handleDragEnd(event: DragEndEvent): void {
    setDropTarget(undefined)
    if (slotDataOf(event.active.data).regionId != null) {
      handleRegionDragEnd(event)
      return
    }
    if (slotDataOf(event.active.data).slot === true) {
      handleSlotDragEnd(event)
      return
    }
    const target = dropTargetOf(event)
    if (target == null) return
    const activeId = String(event.active.id)
    const parentOrder = dropParentOrder(
      sections.map((section) => section.id),
      activeId,
      target
    )
    const block = campaign.blocks.find((candidate) => candidate.id === activeId)
    if (parentOrder == null || block == null) return
    addBlockOrder(block, parentOrder)
  }

  return (
    <Box
      data-testid="CampaignCanvas"
      sx={{
        position: 'relative',
        flexGrow: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch',
        bgcolor: 'background.default',
        px: 4,
        py: 3
      }}
    >
      <FontLoader fonts={fonts} />
      <Box
        ref={stageRef}
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box
          data-testid="CampaignCanvasScale"
          data-scale={scale}
          sx={{
            width: frameWidth * scale,
            height: '100%',
            flexShrink: 0,
            bgcolor: 'background.paper',
            borderRadius: FRAME_RADIUS,
            overflow: 'hidden',
            boxShadow: 2
          }}
        >
          <Box
            sx={{
              width: frameWidth,
              height: frameHeight,
              transform: `scale(${scale})`,
              transformOrigin: 'top left'
            }}
          >
            <FramePortal
              width={frameWidth}
              height="100%"
              dir={rtl ? 'rtl' : 'ltr'}
              fontFamilies={fontFamilies}
              title={t('Campaign preview')}
              data-testid="CampaignCanvasFrame"
            >
              {({ document }) => (
                <ThemeProvider theme={theme}>
                  <FrameTheme document={document}>
                    <CssBaseline />
                    <FrameDocument document={document} />
                    <CanvasHoverReporter document={document} />
                    <Hotkeys document={document} />
                    <Box
                      data-testid="CampaignCanvasPage"
                      onClick={() => selectBlock(undefined)}
                      sx={{
                        height: '100%',
                        overflowY: 'auto',
                        // A column so a short page's footer sits at the frame's bottom edge, as on the public page.
                        display: 'flex',
                        flexDirection: 'column',
                        '& > *': { flexShrink: 0 },
                        bgcolor: 'background.default',
                        color: 'text.primary'
                      }}
                    >
                      <DndContext
                        sensors={sensors}
                        collisionDetection={collisionDetection}
                        onDragMove={handleDragMove}
                        onDragEnd={handleDragEnd}
                        onDragCancel={() => setDropTarget(undefined)}
                      >
                        {header != null && <CanvasSection block={header} />}
                        {pageId != null && (
                          <CanvasInsertPoint pageId={pageId} parentOrder={0} />
                        )}
                        {sections.map((section, index) => (
                          <Fragment key={section.id}>
                            <CanvasSection
                              block={section}
                              draggable
                              dropEdge={
                                dropTarget?.overId === section.id
                                  ? dropTarget.edge
                                  : undefined
                              }
                            />
                            {pageId != null && (
                              <CanvasInsertPoint
                                pageId={pageId}
                                parentOrder={index + 1}
                              />
                            )}
                          </Fragment>
                        ))}
                        {footer != null && <CanvasSection block={footer} />}
                      </DndContext>
                    </Box>
                  </FrameTheme>
                </ThemeProvider>
              )}
            </FramePortal>
          </Box>
        </Box>
      </Box>
      <PreviewLanguageChip />
    </Box>
  )
}
