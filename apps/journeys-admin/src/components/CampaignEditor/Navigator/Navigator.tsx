import Chip from '@mui/material/Chip'
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

import EyeClosedIcon from '@core/shared/ui/icons/EyeClosed'

import { blockLabel } from '../blockLabel'
import { useCampaignEditor } from '../CampaignEditorProvider'

import { useCanvasHovered } from './NavigatorHover'
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

/** A row: the type name, the block's own title text muted beside it, the above / below tag and the badges. */
function NavigatorRowLabel({ node }: NavigatorRowLabelProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const rows = useContext(NavigatorRowsContext)
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', minWidth: 0, py: 0.5 }}
    >
      <Typography variant="body2" noWrap sx={{ flexShrink: 0 }}>
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
    </Stack>
  )
}

/**
 * One tree row. Enter and Space select it (the tree's own Enter toggles
 * expansion instead); the arrows keep moving focus only. Hovering it outlines
 * the block on the canvas, and the canvas hovering the block highlights it.
 */
const NavigatorItem = forwardRef<HTMLLIElement, TreeItemProps>(
  function NavigatorItem(props, ref): ReactElement {
    const node = useTreeItemModel<NavigatorNode>(props.itemId)
    const rows = useContext(NavigatorRowsContext)
    const canvasHovered = useCanvasHovered(node?.domId ?? props.itemId)

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
      />
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
      if (node.regionId != null) selectRegion(node.regionId, node.hostBlockId)
      else selectBlock(node.blockId)
      frameDocumentRef.current
        ?.getElementById(node.domId)
        ?.scrollIntoView({ block: 'nearest' })
    },
    [selectBlock, selectRegion, frameDocumentRef]
  )

  const labelOf = useCallback(
    (node: NavigatorNode) =>
      node.type === 'Region' ? t('Region') : blockLabel(t, node.type),
    [t]
  )
  const rows = useMemo(
    () => ({ onSelect: handleSelect, onHover: handleHover, labelOf }),
    [handleSelect, handleHover, labelOf]
  )

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
        <RichTreeView
          items={tree}
          getItemId={(node) => node.id}
          getItemLabel={(node) =>
            `${labelOf(node)} ${node.secondaryText ?? ''}`
          }
          getItemChildren={(node) => node.children}
          slots={{ item: NavigatorItem }}
          expansionTrigger="iconContainer"
          expandedItems={expandedItems}
          onExpandedItemsChange={(_event, itemIds) => setOpenedIds(itemIds)}
          selectedItems={selectedId ?? null}
          onItemClick={handleItemClick}
          aria-label={t('Page structure')}
          sx={{ flexGrow: 1, overflowY: 'auto', px: 1, pb: 2 }}
        />
      </NavigatorRowsContext.Provider>
    </Stack>
  )
}
