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

/** What a row is called: a block's typename, or a region card. */
export type NavigatorNodeType = CampaignBlock['__typename'] | 'Region'

export type NavigatorExtraPlacement = 'above' | 'below'

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
    children
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
        children: regionLines(campaign.blocks, region.id)
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
          }))
      }
    })
}

/**
 * The Navigator's tree: exactly what the canvas shows. The Header, the page's
 * sections in order, the Footer; under a section its Extras, Column Slots,
 * carousel cards and journey cards in `parentOrder` (an Extra tagged above or
 * below); under a Region Switcher its region cards and their Region Lines.
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
  return [header, ...sections, footer]
    .filter((block) => block != null)
    .map((block) => blockNode(block, undefined, campaign, currentRegionId))
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
