import {
  Announcements,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTreeItemModel } from '@mui/x-tree-view/hooks'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView'
import { TreeItem, TreeItemProps } from '@mui/x-tree-view/TreeItem'
import { useTranslation } from 'next-i18next/pages'
import {
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import DragIcon from '@core/shared/ui/icons/Drag'
import EyeClosedIcon from '@core/shared/ui/icons/EyeClosed'

import { blockLabel } from '../blockLabel'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { slotSection } from '../sectionTypes'
import { useCampaignBlockOrderCommand } from '../utils/useCampaignBlockOrderCommand'
import { useCampaignRegionCommand } from '../utils/useCampaignRegionCommand'
import { useColumnSwapCommand } from '../utils/useColumnSwapCommand'

import { useCanvasHovered } from './NavigatorHover'
import {
  NavigatorDragData,
  navigatorCollisionDetection,
  navigatorKeyboardCoordinates,
  planReorder
} from './navigatorReorder'
import {
  NavigatorNode,
  ancestorIds,
  buildNavigatorTree,
  expandableIds,
  flattenNavigatorTree,
  selectedNodeId
} from './navigatorTree'

interface NavigatorRowsContextValue {
  onSelect: (node: NavigatorNode) => void
  onHover: (node: NavigatorNode | undefined) => void
  labelOf: (node: NavigatorNode) => string
}

const NavigatorRowsContext = createContext<
  NavigatorRowsContextValue | undefined
>(undefined)

interface NavigatorRowLabelProps {
  node: NavigatorNode
}

/** The tree view moves nothing while a row is dragged: the row it would land on is marked instead. */
const noShift = (): null => null

interface NavigatorRowContentProps extends NavigatorRowLabelProps {
  /** The drag handle at the end of a movable row. */
  handle?: ReactElement
  /** Marks the row a dragged row would land on, on the side it would land. */
  dropEdge?: 'before' | 'after'
  dragging?: boolean
}

/** A row: the type name, the block's own title text muted beside it, the above / below tag and the badges. */
const NavigatorRowContent = forwardRef<
  HTMLDivElement,
  NavigatorRowContentProps
>(function NavigatorRowContent(
  { node, handle, dropEdge, dragging = false },
  ref
): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const rows = useContext(NavigatorRowsContext)
  const divider = node.type === 'SectionContent'
  return (
    <Stack
      ref={ref}
      direction="row"
      spacing={1}
      data-testid={dropEdge != null ? 'NavigatorDropTarget' : undefined}
      data-drop-edge={dropEdge}
      sx={{
        alignItems: 'center',
        minWidth: 0,
        py: 0.5,
        opacity: dragging ? 0.5 : 1,
        boxShadow: (theme) =>
          dropEdge == null
            ? 'none'
            : `inset 0 ${dropEdge === 'before' ? 2 : -2}px 0 0 ${theme.palette.primary.main}`
      }}
    >
      <Typography
        variant={divider ? 'caption' : 'body2'}
        noWrap
        sx={{
          flexShrink: 0,
          ...(divider && {
            color: 'text.secondary',
            textTransform: 'uppercase'
          })
        }}
      >
        {rows?.labelOf(node)}
      </Typography>
      {node.secondaryText != null && (
        <Typography
          variant="caption"
          noWrap
          data-testid="NavigatorSecondaryText"
          sx={{ color: 'text.secondary', minWidth: 0, flexShrink: 1 }}
        >
          {node.secondaryText}
        </Typography>
      )}
      {node.placement != null && (
        <Chip
          size="small"
          variant="outlined"
          label={node.placement === 'above' ? t('Above') : t('Below')}
          data-testid="NavigatorPlacement"
          sx={{ flexShrink: 0 }}
        />
      )}
      {node.needsJourney && (
        <Chip
          size="small"
          color="warning"
          label={t('Needs journey')}
          data-testid="NavigatorNeedsJourney"
          sx={{ flexShrink: 0 }}
        />
      )}
      {node.unlisted && (
        <EyeClosedIcon
          fontSize="small"
          titleAccess={t('Not listed')}
          data-testid="NavigatorUnlisted"
          sx={{ flexShrink: 0, color: 'text.secondary' }}
        />
      )}
      {handle != null && <Box sx={{ ml: 'auto !important' }}>{handle}</Box>}
    </Stack>
  )
})

/**
 * A row that takes part in reordering: a sortable of its parent's context,
 * dragged by a handle button at its end. The handle takes Space, Enter and
 * the arrows only while it has focus (the tree ignores keys from inside a
 * row); the row's own keys are untouched. The divider is a drop target only.
 */
function SortableRowLabel({ node }: NavigatorRowLabelProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const rows = useContext(NavigatorRowsContext)
  const data: NavigatorDragData = { group: node.reorder?.group }
  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    isDragging,
    isOver,
    active,
    index,
    activeIndex
  } = useSortable({
    id: node.id,
    data,
    disabled: { draggable: node.type === 'SectionContent' }
  })
  const dropTarget = isOver && active != null && active.id !== node.id

  function handleKeyDown(event: KeyboardEvent<HTMLElement>): void {
    Object.assign(event, { defaultMuiPrevented: true })
    listeners?.onKeyDown?.(event)
  }

  function handleClick(event: MouseEvent<HTMLElement>): void {
    event.stopPropagation()
  }

  const handle =
    node.type === 'SectionContent' ? undefined : (
      <IconButton
        ref={setActivatorNodeRef}
        size="small"
        disableRipple
        {...attributes}
        {...listeners}
        aria-label={t('Reorder {{label}}', { label: rows?.labelOf(node) })}
        data-testid={`NavigatorDragHandle-${node.id}`}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        sx={{
          p: 0.25,
          color: 'text.secondary',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
      >
        <DragIcon fontSize="small" />
      </IconButton>
    )

  return (
    <NavigatorRowContent
      ref={setNodeRef}
      node={node}
      handle={handle}
      dragging={isDragging}
      dropEdge={
        dropTarget ? (activeIndex < index ? 'after' : 'before') : undefined
      }
    />
  )
}

function NavigatorRowLabel({ node }: NavigatorRowLabelProps): ReactElement {
  if (node.reorder == null) return <NavigatorRowContent node={node} />
  return <SortableRowLabel node={node} />
}

/**
 * One tree row. Enter and Space select it (the tree's own Enter toggles
 * expansion instead); the arrows keep moving focus only. Hovering it outlines
 * the block on the canvas, and the canvas hovering the block highlights it.
 * Its movable children sit in one sortable context, so a drag among them
 * never reaches another parent's rows.
 */
const NavigatorItem = forwardRef<HTMLLIElement, TreeItemProps>(
  function NavigatorItem(props, ref): ReactElement {
    const node = useTreeItemModel<NavigatorNode>(props.itemId)
    const rows = useContext(NavigatorRowsContext)
    const canvasHovered = useCanvasHovered(node?.domId ?? props.itemId)
    const movableChildIds =
      node?.children
        .filter((child) => child.reorder != null)
        .map((child) => child.id) ?? []

    function handleKeyDown(event: KeyboardEvent<HTMLLIElement>): void {
      if (node == null || event.target !== event.currentTarget) return
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      Object.assign(event, { defaultMuiPrevented: true })
      rows?.onSelect(node)
    }

    function handleIconClick(event: MouseEvent<HTMLElement>): void {
      event.stopPropagation()
    }

    return (
      <TreeItem
        {...props}
        ref={ref}
        label={node == null ? props.label : <NavigatorRowLabel node={node} />}
        onKeyDown={handleKeyDown}
        data-testid={`NavigatorRow-${props.itemId}`}
        data-canvas-hovered={canvasHovered ? '' : undefined}
        slotProps={{
          content: {
            onMouseEnter: () => rows?.onHover(node ?? undefined),
            onMouseLeave: () => rows?.onHover(undefined)
          },
          iconContainer: { onClick: handleIconClick }
        }}
        sx={{
          '& > .MuiTreeItem-content': { minWidth: 0 },
          '&[data-canvas-hovered] > .MuiTreeItem-content': {
            bgcolor: 'action.hover'
          }
        }}
      >
        {movableChildIds.length === 0 ? (
          props.children
        ) : (
          <SortableContext
            id={props.itemId}
            items={movableChildIds}
            strategy={noShift}
          >
            {props.children}
          </SortableContext>
        )}
      </TreeItem>
    )
  }
)

function unique(ids: string[]): string[] {
  return [...new Set(ids)]
}

/**
 * The Navigator: the open page as a tree of exactly what the canvas shows.
 * Clicking a row (or Enter / Space on it) selects the block or region card
 * through the editor's two selection actions and scrolls the canvas to it;
 * arrow keys move focus only. One level shows by default, the ancestors of
 * the selection always expand (derived from it, never stored), and Option+Z
 * expands or collapses all. Hovering a row sets `data-hovered` on the
 * canvas element straight through the frame document, with no React state.
 * A row is moved among its siblings by its drag handle: a drop on a sibling is
 * one order, swap or region-order Command, and a drop anywhere else is none.
 */
export function Navigator(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    currentRegion,
    selection,
    selectBlock,
    selectRegion,
    frameDocumentRef,
    state: { pageKind, navigatorExpandRequest }
  } = useCampaignEditor()
  const tree = useMemo(
    () =>
      buildNavigatorTree({
        campaign,
        pageKind,
        currentRegionId: currentRegion?.id
      }),
    [campaign, pageKind, currentRegion?.id]
  )
  const selectedId = selectedNodeId(tree, selection)
  const [openedIds, setOpenedIds] = useState<string[]>([])
  const expandedItems = useMemo(
    () => unique([...openedIds, ...ancestorIds(tree, selectedId)]),
    [openedIds, tree, selectedId]
  )
  const rootMovableIds = useMemo(
    () => tree.filter((node) => node.reorder != null).map((node) => node.id),
    [tree]
  )
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: navigatorKeyboardCoordinates
    })
  )
  const { addBlockOrder } = useCampaignBlockOrderCommand()
  const { addColumnSwap } = useColumnSwapCommand()
  const { reorderRegion } = useCampaignRegionCommand()
  const hoveredElement = useRef<Element | null>(null)
  const seenExpandRequest = useRef(navigatorExpandRequest)

  useEffect(() => {
    if (navigatorExpandRequest === seenExpandRequest.current) return
    seenExpandRequest.current = navigatorExpandRequest
    const expandable = expandableIds(tree)
    const allExpanded = expandable.every((id) => expandedItems.includes(id))
    setOpenedIds(allExpanded ? [] : expandable)
  }, [navigatorExpandRequest, tree, expandedItems])

  const clearHover = useCallback(() => {
    hoveredElement.current?.removeAttribute('data-hovered')
    hoveredElement.current = null
  }, [])

  useEffect(() => clearHover, [clearHover])

  const handleHover = useCallback(
    (node: NavigatorNode | undefined) => {
      clearHover()
      if (node == null) return
      const element = frameDocumentRef.current?.getElementById(node.domId)
      if (element == null) return
      element.setAttribute('data-hovered', '')
      hoveredElement.current = element
    },
    [clearHover, frameDocumentRef]
  )

  const handleSelect = useCallback(
    (node: NavigatorNode) => {
      if (node.blockId == null && node.regionId == null) return
      if (node.regionId != null) selectRegion(node.regionId, node.hostBlockId)
      else selectBlock(node.blockId)
      frameDocumentRef.current
        ?.getElementById(node.domId)
        ?.scrollIntoView({ block: 'nearest' })
    },
    [selectBlock, selectRegion, frameDocumentRef]
  )

  const labelOf = useCallback(
    (node: NavigatorNode) => {
      if (node.type === 'Region') return t('Region')
      if (node.type === 'SectionContent') return t('Section content')
      return blockLabel(t, node.type)
    },
    [t]
  )
  const rows = useMemo(
    () => ({ onSelect: handleSelect, onHover: handleHover, labelOf }),
    [handleSelect, handleHover, labelOf]
  )

  function nameOf(id: string | number): string {
    const node = flattenNavigatorTree(tree).find((n) => n.id === String(id))
    return node == null ? '' : labelOf(node)
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      t('Picked up {{label}}.', { label: nameOf(active.id) }),
    onDragOver: ({ active, over }) =>
      over == null
        ? undefined
        : t('{{label}} is over {{target}}.', {
            label: nameOf(active.id),
            target: nameOf(over.id)
          }),
    onDragEnd: ({ active }) =>
      t('Dropped {{label}}.', { label: nameOf(active.id) }),
    onDragCancel: ({ active }) =>
      t('Moving {{label}} cancelled.', { label: nameOf(active.id) })
  }

  /** A drop on a sibling is one Command: the order, the column swap or the region order. */
  function handleDragEnd(event: DragEndEvent): void {
    const overId = event.collisions?.[0]?.id
    if (overId == null) return
    const plan = planReorder({
      campaign,
      tree,
      activeId: String(event.active.id),
      overId: String(overId)
    })
    if (plan == null) return
    if (plan.kind === 'region') reorderRegion(plan.region, plan.order)
    else if (plan.kind === 'swap')
      addColumnSwap(plan.slot, slotSection(campaign.blocks, plan.slot.id)?.id)
    else addBlockOrder(plan.block, plan.parentOrder, plan.placement)
  }

  function handleItemClick(_event: MouseEvent, itemId: string): void {
    const node = flattenNavigatorTree(tree).find((n) => n.id === itemId)
    if (node != null) handleSelect(node)
  }

  return (
    <Stack data-testid="Navigator" sx={{ minHeight: 0, flexGrow: 1 }}>
      <Typography variant="subtitle1" sx={{ px: 2, py: 1.5 }}>
        {t('Navigator')}
      </Typography>
      <NavigatorRowsContext.Provider value={rows}>
        <DndContext
          sensors={sensors}
          collisionDetection={navigatorCollisionDetection}
          onDragEnd={handleDragEnd}
          accessibility={{
            announcements,
            screenReaderInstructions: {
              draggable: t(
                'To pick up a row, press space or enter. Use the arrow keys to move it among its siblings, then press space or enter to drop it, or escape to cancel.'
              )
            }
          }}
        >
          <SortableContext id="root" items={rootMovableIds} strategy={noShift}>
            <RichTreeView
              items={tree}
              getItemId={(node) => node.id}
              getItemLabel={(node) =>
                `${labelOf(node)} ${node.secondaryText ?? ''}`
              }
              getItemChildren={(node) => node.children}
              isItemSelectionDisabled={(node) => node.type === 'SectionContent'}
              slots={{ item: NavigatorItem }}
              expansionTrigger="iconContainer"
              expandedItems={expandedItems}
              onExpandedItemsChange={(_event, itemIds) => setOpenedIds(itemIds)}
              selectedItems={selectedId ?? null}
              onItemClick={handleItemClick}
              aria-label={t('Page structure')}
              sx={{ flexGrow: 1, overflowY: 'auto', px: 1, pb: 2 }}
            />
          </SortableContext>
        </DndContext>
      </NavigatorRowsContext.Provider>
    </Stack>
  )
}
