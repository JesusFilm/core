import {
  carouselCards,
  transformCampaignBlocks
} from '@core/journeys/ui/Campaign'
import type { CampaignTreeBlock } from '@core/journeys/ui/Campaign'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks as CampaignBlock
} from '../../../../__generated__/GetCampaign'
import {
  CampaignChildPlacement,
  CampaignPageKind
} from '../../../../__generated__/globalTypes'
import {
  CampaignSelection,
  regionLines,
  regionNeedsJourney,
  sortedRegions
} from '../CampaignEditorProvider'

/** What a row is called: a block's typename, a region card, or the divider between a section's above and below Extras. */
export type NavigatorNodeType =
  | CampaignBlock['__typename']
  | 'Region'
  | 'SectionContent'

export type NavigatorExtraPlacement = 'above' | 'below'

/** Which Command a drop in a sibling group dispatches. */
export type NavigatorReorderKind = 'block' | 'extra' | 'columnSlot' | 'region'

/** A row that takes part in drag-to-reorder: the sibling group it can be dropped in. */
export interface NavigatorReorder {
  /** `<parent row id>:<what the group holds>`; rows in different groups never collide. */
  group: string
  kind: NavigatorReorderKind
}

export interface NavigatorNode {
  /** The tree item id; the block id, or `<switcher id>__<region id>` for a region card. */
  id: string
  /** The id of the canvas element that renders the node: its DOM `id`. */
  domId: string
  type: NavigatorNodeType
  /** The block this row selects; absent on a region card. */
  blockId?: string
  /** A region card: the region it selects. */
  regionId?: string
  /** A region card: the Region Switcher it sits in. */
  hostBlockId?: string
  /** The block's own title text, shown muted beside the type name. */
  secondaryText?: string
  /** An Extra's placement relative to its section's own content. */
  placement?: NavigatorExtraPlacement
  /** A region card whose Share Languages are not all linked to a journey. */
  needsJourney: boolean
  /** A region card whose region is not listed on the switcher. */
  unlisted: boolean
  /** Absent when the row has no sibling of its kind to be moved among. */
  reorder?: NavigatorReorder
  children: NavigatorNode[]
}

interface BuildNavigatorTreeParams {
  campaign: Pick<Campaign, 'blocks' | 'pages' | 'regions' | 'defaultLanguageId'>
  pageKind: CampaignPageKind
  /** The region the Region Page is rendered for; its own card is left out of the switcher. */
  currentRegionId?: string
}

const SECONDARY_TEXT_FIELDS = [
  'title',
  'content',
  'label',
  'eyebrow',
  'intro'
] as const

/** The block's own title text: its first non-empty title-like field. */
export function secondaryTextOf(block: CampaignBlock): string | undefined {
  const fields = block as unknown as Record<string, unknown>
  for (const field of SECONDARY_TEXT_FIELDS) {
    const value = fields[field]
    if (typeof value === 'string' && value.trim() !== '') return value.trim()
  }
  return undefined
}

function placementOf(
  block: CampaignBlock,
  parent: CampaignBlock | undefined
): NavigatorExtraPlacement | undefined {
  if (parent == null) return undefined
  if (
    block.__typename !== 'CampaignTypographyBlock' &&
    block.__typename !== 'CampaignButtonBlock'
  )
    return undefined
  return block.placement === CampaignChildPlacement.above ? 'above' : 'below'
}

/** The body kinds that reorder among their own kind, by the section that holds them: carousel cards, journey cards, Column Slots and region cards. */
const BODY_REORDER_KINDS: ReadonlyArray<
  [NavigatorNodeType, NavigatorNodeType, NavigatorReorderKind]
> = [
  ['CampaignVideoCarouselBlock', 'CampaignVideoBlock', 'block'],
  ['CampaignJourneyListBlock', 'CampaignJourneyBlock', 'block'],
  ['CampaignColumnsBlock', 'CampaignColumnBlock', 'columnSlot'],
  ['CampaignRegionSwitcherBlock', 'Region', 'region']
]

/** Marks the rows of one sibling group movable; a group of one has nothing to move among. */
function inGroup(
  nodes: NavigatorNode[],
  group: string,
  kind: NavigatorReorderKind
): NavigatorNode[] {
  if (nodes.length < 2) return nodes
  return nodes.map((node) => ({ ...node, reorder: { group, kind } }))
}

/**
 * A node's children as the canvas orders them: the Extras placed above, the
 * body (cards, slots, region cards), then the Extras placed below. When there
 * are Extras a divider row stands where the body starts, so an Extra can be
 * dragged across it to change its placement.
 */
function childRows(
  block: CampaignBlock,
  nodes: NavigatorNode[]
): NavigatorNode[] {
  const body = nodes.filter((node) => node.placement == null)
  const regrouped = new Map<string, NavigatorNode>()
  for (const [parentType, type, kind] of BODY_REORDER_KINDS) {
    if (block.__typename !== parentType) continue
    const members = body.filter((node) => node.type === type)
    for (const node of inGroup(members, `${block.id}:${type}`, kind))
      regrouped.set(node.id, node)
  }
  const bodyRows = body.map((node) => regrouped.get(node.id) ?? node)

  const above = nodes.filter((node) => node.placement === 'above')
  const below = nodes.filter((node) => node.placement === 'below')
  if (above.length + below.length === 0) return bodyRows
  const divider: NavigatorNode = {
    id: `${block.id}__content`,
    domId: `${block.id}__content`,
    type: 'SectionContent',
    needsJourney: false,
    unlisted: false,
    children: []
  }
  const extraRows = inGroup(
    [...above, divider, ...below],
    `${block.id}:extras`,
    'extra'
  )
  return [
    ...extraRows.filter((node) => node.placement === 'above'),
    ...extraRows.filter((node) => node.type === 'SectionContent'),
    ...bodyRows,
    ...extraRows.filter((node) => node.placement === 'below')
  ]
}

/**
 * The children the canvas renders. A Video Carousel shows only its cards: in
 * Watch mode (`videoId` set) none of its items, otherwise the items that make
 * a card; the rest are hidden data a row must not select.
 */
function shownChildren(
  block: CampaignTreeBlock<CampaignBlock>,
  languageId: string
): Array<CampaignTreeBlock<CampaignBlock>> {
  if (block.__typename !== 'CampaignVideoCarouselBlock') return block.children
  if (block.videoId != null) return []
  const cardIds = new Set(
    carouselCards(block, languageId).map((card) => card.id)
  )
  return block.children.filter((child) => cardIds.has(child.id))
}

function blockNode(
  block: CampaignTreeBlock<CampaignBlock>,
  parent: CampaignBlock | undefined,
  campaign: BuildNavigatorTreeParams['campaign'],
  currentRegionId: string | undefined
): NavigatorNode {
  const children = shownChildren(block, campaign.defaultLanguageId).map(
    (child) => blockNode(child, block, campaign, currentRegionId)
  )
  if (block.__typename === 'CampaignRegionSwitcherBlock')
    children.push(...regionNodes(campaign, block.id, currentRegionId))
  return {
    id: block.id,
    domId: block.id,
    type: block.__typename,
    blockId: block.id,
    secondaryText: secondaryTextOf(block),
    placement: placementOf(block, parent),
    needsJourney: false,
    unlisted: false,
    children: childRows(block, children)
  }
}

/**
 * A switcher's region cards in switcher order, each with its Region Lines.
 * Unlisted regions are kept (with the unlisted badge) so they stay reachable;
 * the region being rendered is left out, as the canvas hides it on its own page.
 */
function regionNodes(
  campaign: BuildNavigatorTreeParams['campaign'],
  hostBlockId: string,
  currentRegionId: string | undefined
): NavigatorNode[] {
  return sortedRegions(campaign.regions)
    .filter((region) => region.id !== currentRegionId)
    .map((region) => {
      const id = `${hostBlockId}__${region.id}`
      return {
        id,
        domId: id,
        type: 'Region' as const,
        regionId: region.id,
        hostBlockId,
        secondaryText: region.name,
        needsJourney: regionNeedsJourney(region),
        unlisted: !region.listed,
        children: inGroup(
          regionLines(campaign.blocks, region.id)
            .filter((line) => line.__typename === 'CampaignTypographyBlock')
            .map((line) => ({
              id: `${id}__${line.id}`,
              domId: line.id,
              type: line.__typename,
              blockId: line.id,
              secondaryText: secondaryTextOf(line),
              needsJourney: false,
              unlisted: false,
              children: []
            })),
          `${id}:lines`,
          'block'
        )
      }
    })
}

/**
 * The Navigator's tree: exactly what the canvas shows. The Header, the page's
 * sections in order, the Footer; under a section its Extras (tagged above or
 * below), Column Slots, carousel cards and journey cards, in the canvas's order;
 * under a Region Switcher its region cards and their Region Lines. Rows that
 * can be moved among their siblings carry their sibling group.
 */
export function buildNavigatorTree({
  campaign,
  pageKind,
  currentRegionId
}: BuildNavigatorTreeParams): NavigatorNode[] {
  const pageId = campaign.pages.find((page) => page.kind === pageKind)?.id
  const sections = transformCampaignBlocks(
    campaign.blocks.filter((block) => block.pageId === pageId)
  )
  const chrome = transformCampaignBlocks(
    campaign.blocks.filter(
      (block) => block.pageId == null && block.regionId == null
    )
  )
  const header = chrome.find(
    (block) => block.__typename === 'CampaignHeaderBlock'
  )
  const footer = chrome.find(
    (block) => block.__typename === 'CampaignFooterBlock'
  )
  const sectionNodes = inGroup(
    sections.map((section) =>
      blockNode(section, undefined, campaign, currentRegionId)
    ),
    'root:sections',
    'block'
  )
  const chromeNode = (block: (typeof chrome)[number] | undefined) =>
    block == null
      ? []
      : [blockNode(block, undefined, campaign, currentRegionId)]
  return [...chromeNode(header), ...sectionNodes, ...chromeNode(footer)]
}

/** Every node of the tree, parents before their children. */
export function flattenNavigatorTree(nodes: NavigatorNode[]): NavigatorNode[] {
  return nodes.flatMap((node) => [node, ...flattenNavigatorTree(node.children)])
}

/** The ids of the nodes that have children. */
export function expandableIds(nodes: NavigatorNode[]): string[] {
  return flattenNavigatorTree(nodes)
    .filter((node) => node.children.length > 0)
    .map((node) => node.id)
}

/** The tree item the selection sits on; the first match when a block appears twice. */
export function selectedNodeId(
  nodes: NavigatorNode[],
  selection: CampaignSelection
): string | undefined {
  const all = flattenNavigatorTree(nodes)
  if (selection.kind === 'region' && selection.region != null) {
    const regionId = selection.region.id
    const cards = all.filter((node) => node.regionId === regionId)
    return (
      cards.find((node) => node.hostBlockId === selection.host?.id) ?? cards[0]
    )?.id
  }
  const blockId = selection.block?.id
  if (blockId == null) return undefined
  return all.find((node) => node.blockId === blockId)?.id
}

/** The ids of every ancestor of a node, outermost first; empty when it is not in the tree. */
export function ancestorIds(
  nodes: NavigatorNode[],
  targetId: string | undefined
): string[] {
  if (targetId == null) return []
  for (const node of nodes) {
    if (node.id === targetId) return []
    const below = ancestorIds(node.children, targetId)
    if (below.length > 0 || node.children.some((c) => c.id === targetId))
      return [node.id, ...below]
  }
  return []
}
