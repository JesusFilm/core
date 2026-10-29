import { DroppableContainer } from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import sortBy from 'lodash/sortBy'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks as CampaignBlock
} from '../../../../__generated__/GetCampaign'
import { CampaignChildPlacement } from '../../../../__generated__/globalTypes'
import { sortedRegions } from '../CampaignEditorProvider'
import { scopedCollisionDetection } from '../utils/scopedCollisionDetection'
import { siblingsOf } from '../utils/siblingsOf'
import type { CampaignReorder } from '../utils/useCampaignReorder'

import { NavigatorNode, flattenNavigatorTree } from './navigatorTree'

/** The drag data every Navigator row carries, set on its sortable. */
export interface NavigatorDragData {
  group?: string
}

type DragDataHolder = { data?: { current?: NavigatorDragData } } | null

function groupOf(holder: DragDataHolder | undefined): string | undefined {
  return holder?.data?.current?.group
}

/**
 * The droppables a drag can land on: only rows of the dragged row's own
 * sibling group. Nothing outside the group ever collides, so it never
 * highlights and never accepts a drop; a row with no group collides with nothing.
 */
export function droppablesInGroupOf(
  active: DragDataHolder | undefined,
  containers: DroppableContainer[]
): DroppableContainer[] {
  const group = groupOf(active)
  if (group == null) return []
  return containers.filter((container) => groupOf(container) === group)
}

/** The row under the pointer, else the nearest centre, among the dragged row's siblings only. */
export const navigatorCollisionDetection = scopedCollisionDetection((args) =>
  droppablesInGroupOf(args.active, args.droppableContainers)
)

interface PlanReorderParams {
  campaign: Pick<Campaign, 'blocks' | 'regions'>
  tree: NavigatorNode[]
  activeId: string
  overId: string
}

function blockOf(
  blocks: CampaignBlock[],
  node: NavigatorNode
): CampaignBlock | undefined {
  return blocks.find((block) => block.id === node.blockId)
}

/** The position the block takes when it lands on the row of `target`: the slot `target` held among all the block's siblings. */
function planBlockMove(
  blocks: CampaignBlock[],
  active: CampaignBlock,
  target: CampaignBlock
): CampaignReorder | undefined {
  const all = sortBy([...siblingsOf(blocks, active), active], 'parentOrder')
  const parentOrder = all.findIndex((block) => block.id === target.id)
  if (parentOrder < 0 || parentOrder === all.indexOf(active)) return undefined
  return { kind: 'block', block: active, parentOrder }
}

/**
 * Dropping an Extra among its section's Extras and the content divider. The
 * dragged Extra takes the row's place in the list (as a sortable does); the
 * divider then decides its placement, and its neighbours in that placement
 * decide where among all the section's children it sits. A move that changes
 * neither the position nor the placement is no move.
 */
function planExtraMove(
  blocks: CampaignBlock[],
  group: NavigatorNode[],
  active: NavigatorNode,
  over: NavigatorNode
): CampaignReorder | undefined {
  const block = blockOf(blocks, active)
  if (block == null || !('placement' in block)) return undefined
  const ids = group.map((node) => node.id)
  const moved = arrayMove(ids, ids.indexOf(active.id), ids.indexOf(over.id))
  const dividerIndex = moved.findIndex(
    (id) => group.find((node) => node.id === id)?.type === 'SectionContent'
  )
  const activeIndex = moved.indexOf(active.id)
  const placement =
    activeIndex < dividerIndex
      ? CampaignChildPlacement.above
      : CampaignChildPlacement.below
  const members =
    placement === CampaignChildPlacement.above
      ? moved.slice(0, dividerIndex)
      : moved.slice(dividerIndex + 1)
  const position = members.indexOf(active.id)
  const others = siblingsOf(blocks, block)
  const all = sortBy([...others, block], 'parentOrder')
  const currentIndex = all.indexOf(block)
  const indexAmongOthers = (nodeId: string): number => {
    const blockId = group.find((node) => node.id === nodeId)?.blockId
    return others.findIndex((other) => other.id === blockId)
  }
  const next = members[position + 1]
  const previous = members[position - 1]
  let parentOrder = currentIndex
  if (next != null) parentOrder = indexAmongOthers(next)
  else if (previous != null) parentOrder = indexAmongOthers(previous) + 1

  const placementChanged = placement !== block.placement
  if (!placementChanged && parentOrder === currentIndex) return undefined
  return {
    kind: 'block',
    block,
    parentOrder,
    ...(placementChanged ? { placement } : {})
  }
}

/**
 * What a drop of one Navigator row on another does, or undefined when it does
 * nothing: a row dropped on itself, on a row outside its sibling group, or
 * back where it was. Moving a parent needs nothing more, as its children hang
 * off it by `parentBlockId`. There is no re-parenting: the plan never changes
 * a block's parent.
 */
export function planReorder({
  campaign,
  tree,
  activeId,
  overId
}: PlanReorderParams): CampaignReorder | undefined {
  if (activeId === overId) return undefined
  const all = flattenNavigatorTree(tree)
  const active = all.find((node) => node.id === activeId)
  const over = all.find((node) => node.id === overId)
  if (active?.reorder == null || over?.reorder == null) return undefined
  const { group, kind } = active.reorder
  if (over.reorder.group !== group) return undefined

  if (kind === 'region') {
    const regions = sortedRegions(campaign.regions)
    const region = regions.find((candidate) => candidate.id === active.regionId)
    const order = regions.findIndex(
      (candidate) => candidate.id === over.regionId
    )
    if (region == null || order < 0 || order === regions.indexOf(region))
      return undefined
    return { kind: 'region', region, order }
  }

  const block = blockOf(campaign.blocks, active)
  if (block == null) return undefined

  if (kind === 'columnSlot') return { kind: 'swap', slot: block }

  if (kind === 'extra') {
    const members = all.filter((node) => node.reorder?.group === group)
    return planExtraMove(campaign.blocks, members, active, over)
  }

  const target = blockOf(campaign.blocks, over)
  if (target == null) return undefined
  return planBlockMove(campaign.blocks, block, target)
}

type KeyboardCoordinates = typeof sortableKeyboardCoordinates

/**
 * The sortable keyboard coordinates, limited to the dragged row's sibling
 * group: the arrows step through the group's rows only, never to a row of
 * another group that happens to sit next to it on screen.
 */
export const navigatorKeyboardCoordinates: KeyboardCoordinates = (
  event,
  args
) => {
  const { context } = args
  const droppableContainers = context.droppableContainers
  const siblings = droppablesInGroupOf(
    context.active,
    droppableContainers.getEnabled()
  )
  const scoped = Object.create(
    droppableContainers
  ) as typeof droppableContainers
  scoped.getEnabled = () => siblings
  scoped.get = (id) => siblings.find((container) => container.id === id)
  return sortableKeyboardCoordinates(event, {
    ...args,
    context: { ...context, droppableContainers: scoped }
  })
}
