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
import { ReactElement, useMemo, useState } from 'react'

import {
  createCampaignTheme,
  transformCampaignBlocks
} from '@core/journeys/ui/Campaign'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { getLocaleRTL } from '@core/shared/ui/rtl'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { Hotkeys } from '../Hotkeys'
import { useCampaignBlockOrderCommand } from '../utils/useCampaignBlockOrderCommand'

import { CanvasSection } from './CanvasSection'

export type CanvasView = 'desktop' | 'phone'

/** Phone view: the frame is 390 px wide so the campaign's breakpoints follow the canvas width. */
export const PHONE_FRAME_WIDTH = 390

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

/** The section under the pointer, falling back to the nearest centre at the page's edges. */
const collisionDetection: CollisionDetection = (args) => {
  const within = pointerWithin(args)
  return within.length > 0 ? within : closestCenter(args)
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

interface CanvasProps {
  campaign: Campaign
  pageKind: CampaignPageKind
  view: CanvasView
}

/**
 * The campaign canvas: the chosen page rendered inside a FramePortal iframe
 * with the editor's own section components under the campaign's theme, in
 * the Preview Language the top bar chose (its text direction follows that
 * language's bcp47), the header above and the footer below as on the public
 * page. Desktop/Phone is a view toggle held by the shell, never a Command.
 * The frame carries its own Hotkeys, since its key events never leave it, and
 * a click on the empty frame returns to the campaign row. A section is
 * dragged by its handle only; the drop lands before or after the section
 * under the pointer by its midpoint, as one reorder Command.
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
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 }
    })
  )

  function handleDragMove(event: DragMoveEvent): void {
    setDropTarget(dropTargetOf(event))
  }

  function handleDragEnd(event: DragEndEvent): void {
    setDropTarget(undefined)
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
        flexGrow: 1,
        minHeight: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch',
        bgcolor: 'background.default',
        px: 4,
        py: 3
      }}
    >
      <Box
        sx={{
          width: view === 'phone' ? PHONE_FRAME_WIDTH : '100%',
          maxWidth: '100%',
          height: '100%',
          bgcolor: 'background.paper',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: 2
        }}
      >
        <FramePortal
          width={view === 'phone' ? PHONE_FRAME_WIDTH : '100%'}
          height="100%"
          dir={rtl ? 'rtl' : 'ltr'}
          fontFamilies={fontFamilies}
          title={t('Campaign preview')}
          data-testid="CampaignCanvasFrame"
        >
          {({ document }) => (
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Hotkeys document={document} />
              <Box
                data-testid="CampaignCanvasPage"
                onClick={() => selectBlock(undefined)}
                sx={{
                  height: '100%',
                  overflowY: 'auto',
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
                  {header != null && (
                    <CanvasSection
                      block={header}
                      theme={campaign.theme}
                      previewLanguageId={previewLanguageId}
                    />
                  )}
                  {sections.map((section) => (
                    <CanvasSection
                      key={section.id}
                      block={section}
                      theme={campaign.theme}
                      previewLanguageId={previewLanguageId}
                      draggable
                      dropEdge={
                        dropTarget?.overId === section.id
                          ? dropTarget.edge
                          : undefined
                      }
                    />
                  ))}
                  {footer != null && (
                    <CanvasSection
                      block={footer}
                      theme={campaign.theme}
                      previewLanguageId={previewLanguageId}
                    />
                  )}
                </DndContext>
              </Box>
            </ThemeProvider>
          )}
        </FramePortal>
      </Box>
    </Box>
  )
}
