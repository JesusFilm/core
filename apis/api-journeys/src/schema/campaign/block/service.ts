import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import {
  CampaignAction,
  CampaignBackgroundKind,
  CampaignBackgroundOverlay,
  CampaignBlock,
  CampaignPage,
  Prisma,
  prisma
} from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import {
  Action,
  CampaignWithAcl,
  INCLUDE_CAMPAIGN_ACL,
  campaignAcl
} from '../campaign.acl'
import {
  assertEnum,
  assertEnumOrNull,
  assertHexOrNull,
  badUserInput
} from '../validation'

/**
 * The campaign block service: the Block service's shape, authorised through
 * the Campaign as aggregate root. Every block mutation loads the campaign by
 * `campaignId` with `INCLUDE_CAMPAIGN_ACL` and decides through `campaignAcl`;
 * there are no per-resolver team-scope calls.
 */

export type CampaignBlockWithAction = CampaignBlock & {
  action: CampaignAction | null
}

export const INCLUDE_CAMPAIGN_BLOCK_ACL = {
  action: true,
  campaign: { include: INCLUDE_CAMPAIGN_ACL }
} satisfies Prisma.CampaignBlockInclude

export type CampaignBlockWithCampaignAcl = Prisma.CampaignBlockGetPayload<{
  include: typeof INCLUDE_CAMPAIGN_BLOCK_ACL
}>

/** The two Extra typenames: the only children a section or chrome block takes. */
export const CAMPAIGN_CHILD_TYPENAMES = [
  'CampaignTypographyBlock',
  'CampaignButtonBlock'
] as const
export type CampaignChildTypename = (typeof CAMPAIGN_CHILD_TYPENAMES)[number]

/** Every typename that hosts Extras: the seeded sections and the two chrome blocks. */
export const CAMPAIGN_HOST_TYPENAMES = [
  'CampaignHeroBlock',
  'CampaignRegionSwitcherBlock',
  'CampaignVideoCarouselBlock',
  'CampaignJourneyListBlock',
  'CampaignAnalyticsBlock',
  'CampaignRegionHeaderBlock',
  'CampaignRegionShareBlock',
  'CampaignImageBlock',
  'CampaignFeaturedMediaBlock',
  'CampaignHeaderBlock',
  'CampaignFooterBlock'
] as const

/** Chrome is never deleted, moved or duplicated. */
export const CAMPAIGN_CHROME_TYPENAMES = [
  'CampaignHeaderBlock',
  'CampaignFooterBlock'
] as const

/** The section typenames "+Add section" offers: the seeded seven, the Image and the Featured Media sections. */
export const CAMPAIGN_SECTION_TYPENAMES = [
  'CampaignHeroBlock',
  'CampaignRegionSwitcherBlock',
  'CampaignVideoCarouselBlock',
  'CampaignJourneyListBlock',
  'CampaignAnalyticsBlock',
  'CampaignRegionHeaderBlock',
  'CampaignRegionShareBlock',
  'CampaignImageBlock',
  'CampaignFeaturedMediaBlock'
] as const
export type CampaignSectionTypename =
  (typeof CAMPAIGN_SECTION_TYPENAMES)[number]

/** Sections that read the region being rendered: refused on the landing page. */
export const CAMPAIGN_REGION_ONLY_TYPENAMES = [
  'CampaignRegionHeaderBlock',
  'CampaignRegionShareBlock'
] as const

/** Column slots are created with their Columns section and never touched on their own. */
export const CAMPAIGN_SLOT_TYPENAMES = ['CampaignColumnBlock'] as const

export const CAMPAIGN_CHILD_PLACEMENTS = ['above', 'below'] as const

export function isCampaignChildTypename(
  typename: string
): typename is CampaignChildTypename {
  return (CAMPAIGN_CHILD_TYPENAMES as readonly string[]).includes(typename)
}

export function isCampaignHostTypename(typename: string): boolean {
  return (CAMPAIGN_HOST_TYPENAMES as readonly string[]).includes(typename)
}

export function isCampaignChromeTypename(typename: string): boolean {
  return (CAMPAIGN_CHROME_TYPENAMES as readonly string[]).includes(typename)
}

export function isCampaignRegionOnlyTypename(typename: string): boolean {
  return (CAMPAIGN_REGION_ONLY_TYPENAMES as readonly string[]).includes(
    typename
  )
}

export function isCampaignSlotTypename(typename: string): boolean {
  return (CAMPAIGN_SLOT_TYPENAMES as readonly string[]).includes(typename)
}

function notFound(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } })
}

function forbidden(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } })
}

/** A well-formed request refused by the current state (PRD §15). */
export function conflict(message: string, field: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'CONFLICT', field }
  })
}

/** Block create is campaign Update on the campaign the block will belong to. */
export async function authorizeBlockCreate(
  campaignId: string,
  user: User
): Promise<CampaignWithAcl> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: INCLUDE_CAMPAIGN_ACL
  })
  if (campaign == null) throw notFound('campaign not found')
  if (!campaignAcl(Action.Update, campaign, user))
    throw forbidden('user is not allowed to create block')
  return campaign
}

/**
 * Block update, delete and restore are campaign Update on the block's
 * campaign. A soft-deleted block is not visible, so it is `NOT_FOUND` unless
 * the caller asks for it (restore does).
 */
export async function authorizeBlockUpdate(
  blockId: string,
  user: User,
  options: { includeDeleted?: boolean } = {}
): Promise<CampaignBlockWithCampaignAcl> {
  const block = await findBlockWithAcl(blockId, options.includeDeleted === true)
  if (block == null) throw notFound('block not found')
  if (!campaignAcl(Action.Update, block.campaign, user))
    throw forbidden('user is not allowed to update block')
  return block
}

async function findBlockWithAcl(
  blockId: string,
  includeDeleted: boolean
): Promise<CampaignBlockWithCampaignAcl | null> {
  return await prisma.campaignBlock.findFirst({
    where: {
      id: blockId,
      ...(includeDeleted ? {} : { deletedAt: null })
    },
    include: INCLUDE_CAMPAIGN_BLOCK_ACL
  })
}

export type StructuralVerb = 'deleted' | 'moved' | 'duplicated'

/**
 * Delete, move and duplicate share one gate: campaign Update on the block's
 * campaign, then the protected rows refused with `CONFLICT` / `id` — the
 * header and footer, a column slot, and the landing or Region Page itself.
 * A page id is not a block id, but the editor's structural controls may
 * still address one, so a page is told apart from an unknown id.
 */
export async function authorizeStructuralBlock(
  blockId: string,
  user: User,
  verb: StructuralVerb
): Promise<CampaignBlockWithCampaignAcl> {
  const block = await findBlockWithAcl(blockId, false)
  if (block == null) {
    const page = await prisma.campaignPage.findUnique({
      where: { id: blockId },
      include: { campaign: { include: INCLUDE_CAMPAIGN_ACL } }
    })
    if (page == null) throw notFound('block not found')
    if (!campaignAcl(Action.Update, page.campaign, user))
      throw forbidden('user is not allowed to update block')
    throw conflict(`the landing and region pages cannot be ${verb}`, 'id')
  }
  if (!campaignAcl(Action.Update, block.campaign, user))
    throw forbidden('user is not allowed to update block')
  if (isCampaignChromeTypename(block.typename))
    throw conflict(`the header and footer cannot be ${verb}`, 'id')
  if (isCampaignSlotTypename(block.typename))
    throw conflict(`a column slot cannot be ${verb}`, 'id')
  return block
}

/**
 * A child block's parent is a section or chrome block of the same campaign,
 * not soft-deleted (`BAD_USER_INPUT` / `parentBlockId`), and the child is a
 * Typography or Button block (`BAD_USER_INPUT` / `typename`). Returns the
 * parent so create can copy its scoping down.
 */
export async function validateParentBlock(
  parentBlockId: string,
  campaignId: string,
  typename: string
): Promise<CampaignBlock> {
  if (!isCampaignChildTypename(typename))
    throw badUserInput(
      `typename must be one of ${CAMPAIGN_CHILD_TYPENAMES.join(', ')}`,
      'typename'
    )
  const parent = await prisma.campaignBlock.findFirst({
    where: { id: parentBlockId, campaignId, deletedAt: null }
  })
  if (parent == null || !isCampaignHostTypename(parent.typename))
    throw badUserInput(
      'parentBlockId must be a section or chrome block of this campaign',
      'parentBlockId'
    )
  return parent
}

/** `placement` on a section child: `above` or `below`, defaulting to `below`. */
export function assertPlacement(
  placement: string | null | undefined
): (typeof CAMPAIGN_CHILD_PLACEMENTS)[number] {
  return assertEnum(
    placement ?? 'below',
    'placement',
    CAMPAIGN_CHILD_PLACEMENTS
  )
}

/** The columns that decide which blocks are a block's siblings. */
export type CampaignBlockScope = Pick<
  CampaignBlock,
  'campaignId' | 'pageId' | 'regionId' | 'parentBlockId'
>

/**
 * A block's live, ordered siblings: the parent's children, or for a top-level
 * block the other roots of the same page, region or chrome. Owned blocks
 * (`parentOrder: null`) are never siblings.
 */
export async function getSiblings(
  scope: CampaignBlockScope,
  tx: Prisma.TransactionClient = prisma,
  where: Prisma.CampaignBlockWhereInput = {}
): Promise<CampaignBlockWithAction[]> {
  return await tx.campaignBlock.findMany({
    where: {
      campaignId: scope.campaignId,
      ...(scope.parentBlockId != null
        ? { parentBlockId: scope.parentBlockId }
        : {
            parentBlockId: null,
            pageId: scope.pageId,
            regionId: scope.regionId
          }),
      parentOrder: { not: null },
      deletedAt: null,
      ...where
    },
    orderBy: { parentOrder: 'asc' },
    include: { action: true }
  })
}

/** Renumber siblings contiguously from zero in the order given. */
export async function reorderSiblings(
  siblings: CampaignBlockWithAction[],
  tx: Prisma.TransactionClient = prisma
): Promise<CampaignBlockWithAction[]> {
  return await Promise.all(
    siblings.map(
      async (block, parentOrder) =>
        await tx.campaignBlock.update({
          where: { id: block.id },
          data: { parentOrder },
          include: { action: true }
        })
    )
  )
}

/** Every block edit is a campaign edit: bump the campaign's `updatedAt`. */
export async function touchCampaign(
  tx: Prisma.TransactionClient,
  campaignId: string
): Promise<void> {
  await tx.campaign.update({
    where: { id: campaignId },
    data: { updatedAt: new Date() }
  })
}

export type CampaignChildCreateData = Omit<
  Prisma.CampaignBlockUncheckedCreateInput,
  'campaignId' | 'pageId' | 'regionId' | 'parentBlockId' | 'parentOrder'
>

/**
 * Create a child of `parent` inside `tx`: `parentOrder = siblings.length`
 * (one contiguous sequence across `above` and `below` children) and the
 * parent's `pageId` / `regionId` copied down.
 */
export async function createChildBlock(
  tx: Prisma.TransactionClient,
  parent: CampaignBlock,
  data: CampaignChildCreateData
): Promise<CampaignBlockWithAction> {
  const siblings = await getSiblings(
    { ...parent, parentBlockId: parent.id },
    tx
  )
  const block = await tx.campaignBlock.create({
    data: {
      ...data,
      campaignId: parent.campaignId,
      pageId: parent.pageId,
      regionId: parent.regionId,
      parentBlockId: parent.id,
      parentOrder: siblings.length
    },
    include: { action: true }
  })
  await touchCampaign(tx, parent.campaignId)
  return block
}

/**
 * Write validated columns to a block and bump its campaign. `before` runs
 * first in the same transaction (the Media Slot swap uses it).
 */
export async function updateBlock(
  block: Pick<CampaignBlock, 'id' | 'campaignId'>,
  data: Prisma.CampaignBlockUncheckedUpdateInput,
  before?: (tx: Prisma.TransactionClient) => Promise<void>
): Promise<CampaignBlockWithAction> {
  return await prisma.$transaction(async (tx) => {
    if (before != null) await before(tx)
    const updated = await tx.campaignBlock.update({
      where: { id: block.id },
      data,
      include: { action: true }
    })
    await touchCampaign(tx, block.campaignId)
    return updated
  })
}

/**
 * Soft-delete a block: stamp `deletedAt` and renumber the remaining siblings
 * contiguously. Children keep their rows and fall out of the tree with the
 * parent, so restore brings them back untouched. Returns the renumbered
 * siblings.
 */
export async function removeBlock(
  block: CampaignBlock
): Promise<CampaignBlockWithAction[]> {
  return await prisma.$transaction(async (tx) => {
    await tx.campaignBlock.update({
      where: { id: block.id },
      data: { deletedAt: new Date() }
    })
    const siblings =
      block.parentOrder != null
        ? await reorderSiblings(await getSiblings(block, tx), tx)
        : []
    await touchCampaign(tx, block.campaignId)
    return siblings
  })
}

function getDescendants(
  parentBlockId: string,
  blocks: CampaignBlockWithAction[]
): CampaignBlockWithAction[] {
  const result: CampaignBlockWithAction[] = []
  for (const block of blocks) {
    if (block.parentBlockId !== parentBlockId) continue
    result.push(block, ...getDescendants(block.id, blocks))
  }
  return result
}

/**
 * Restore a soft-deleted block: clear `deletedAt` and re-insert it among its
 * siblings at its own `parentOrder`, renumbering again. Returns the restored
 * block with its siblings and its live descendants, so the editor cache can
 * take the whole subtree back in one write.
 */
export async function restoreBlock(
  block: CampaignBlock
): Promise<CampaignBlockWithAction[]> {
  return await prisma.$transaction(async (tx) => {
    const restored = await tx.campaignBlock.update({
      where: { id: block.id },
      data: { deletedAt: null },
      include: { action: true }
    })
    let siblings: CampaignBlockWithAction[] = [restored]
    if (restored.parentOrder != null) {
      const others = await getSiblings(restored, tx, {
        id: { not: restored.id }
      })
      others.splice(restored.parentOrder, 0, restored)
      siblings = await reorderSiblings(others, tx)
    }
    const live = await tx.campaignBlock.findMany({
      where: {
        campaignId: restored.campaignId,
        deletedAt: null,
        NOT: { id: restored.id }
      },
      include: { action: true }
    })
    await touchCampaign(tx, restored.campaignId)
    return [...siblings, ...getDescendants(restored.id, live)]
  })
}

/**
 * The typed-body update mutations address one typename each: a live block of
 * another typename is `NOT_FOUND`, never silently written.
 */
export async function authorizeTypedBlockUpdate(
  blockId: string,
  user: User,
  typename: string
): Promise<CampaignBlockWithCampaignAcl> {
  const block = await authorizeBlockUpdate(blockId, user)
  if (block.typename !== typename) throw notFound('block not found')
  return block
}

// ---------------------------------------------------------------------------
// Sections: top-level create with an insertion position, reorder, duplicate.
// ---------------------------------------------------------------------------

/** The scoping columns of a top-level row: a page, a region, or neither (chrome). */
export type CampaignTopLevelScope = Pick<
  CampaignBlock,
  'campaignId' | 'pageId' | 'regionId'
>

export type CampaignBlockCreateData = CampaignChildCreateData

/**
 * The scoping rule (PRD §1, §12): a top-level row has at most one of
 * `pageId` / `regionId`, and the header and footer have neither.
 * `BAD_USER_INPUT` / `pageId` either way.
 */
export function assertTopLevelScope(
  typename: string,
  scope: Pick<CampaignBlock, 'pageId' | 'regionId'>
): void {
  if (isCampaignChromeTypename(typename)) {
    if (scope.pageId != null || scope.regionId != null)
      throw badUserInput(
        'the header and footer belong to the campaign, not to a page or region',
        'pageId'
      )
    return
  }
  if (scope.pageId != null && scope.regionId != null)
    throw badUserInput(
      'a top-level block sits on a page or in a region, not both',
      'pageId'
    )
  if (scope.pageId == null && scope.regionId == null)
    throw badUserInput(
      'a top-level block needs a pageId or a regionId',
      'pageId'
    )
}

/** A campaign has exactly one header and one footer: a second is `CONFLICT` / `typename`. */
export async function assertChromeSingleton(
  tx: Prisma.TransactionClient,
  campaignId: string,
  typename: string
): Promise<void> {
  const existing = await tx.campaignBlock.findFirst({
    where: { campaignId, typename, deletedAt: null },
    select: { id: true }
  })
  if (existing != null)
    throw conflict(
      `a campaign has exactly one ${typename === 'CampaignHeaderBlock' ? 'header' : 'footer'}`,
      'typename'
    )
}

/**
 * A section's page is a page of the same campaign (`BAD_USER_INPUT` /
 * `pageId`), and the two region-only sections are refused on the landing
 * page with the same code and field.
 */
export async function validateSectionPage(
  campaignId: string,
  pageId: string,
  typename: string
): Promise<CampaignPage> {
  const page = await prisma.campaignPage.findFirst({
    where: { id: pageId, campaignId }
  })
  if (page == null)
    throw badUserInput('pageId must be a page of this campaign', 'pageId')
  if (page.kind === 'landing' && isCampaignRegionOnlyTypename(typename))
    throw badUserInput(
      `${typename} can only be added to the Region Page`,
      'pageId'
    )
  return page
}

function assertParentOrder(parentOrder: number | null | undefined): void {
  if (parentOrder != null && parentOrder < 0)
    throw badUserInput('parentOrder must be zero or more', 'parentOrder')
}

/**
 * Create a top-level block inside `tx`: the scoping rule, the chrome
 * singleton, then `parentOrder = siblings.length`, or the requested position
 * with the later siblings renumbered contiguously. A position past the end
 * appends. Returns the created row with its final `parentOrder`.
 */
export async function createTopLevelBlock(
  tx: Prisma.TransactionClient,
  scope: CampaignTopLevelScope,
  data: CampaignBlockCreateData,
  parentOrder?: number | null
): Promise<CampaignBlockWithAction> {
  assertTopLevelScope(data.typename, scope)
  assertParentOrder(parentOrder)
  if (isCampaignChromeTypename(data.typename))
    await assertChromeSingleton(tx, scope.campaignId, data.typename)
  const siblings = await getSiblings({ ...scope, parentBlockId: null }, tx)
  const created = await tx.campaignBlock.create({
    data: {
      ...data,
      campaignId: scope.campaignId,
      pageId: scope.pageId,
      regionId: scope.regionId,
      parentBlockId: null,
      parentOrder: siblings.length
    },
    include: { action: true }
  })
  let block = created
  if (parentOrder != null && parentOrder < siblings.length) {
    siblings.splice(parentOrder, 0, created)
    block = (await reorderSiblings(siblings, tx))[parentOrder]
  }
  await touchCampaign(tx, scope.campaignId)
  return block
}

/** Create a section on `page`: `createTopLevelBlock` with the page's scope. */
export async function createSectionBlock(
  tx: Prisma.TransactionClient,
  page: CampaignPage,
  data: CampaignBlockCreateData,
  parentOrder?: number | null
): Promise<CampaignBlockWithAction> {
  return await createTopLevelBlock(
    tx,
    { campaignId: page.campaignId, pageId: page.id, regionId: null },
    data,
    parentOrder
  )
}

/**
 * Move a block among its siblings to `parentOrder` (clamped to the end) and
 * renumber contiguously. An Extra may change `placement` in the same move:
 * crossing the Section Body updates the column, moving among neighbours is
 * an order update only. Returns the renumbered siblings.
 */
export async function reorderBlock(
  block: CampaignBlock,
  parentOrder: number,
  placement?: string | null
): Promise<CampaignBlockWithAction[]> {
  if (block.parentOrder == null)
    throw conflict('an owned block has no order to change', 'id')
  assertParentOrder(parentOrder)
  const nextPlacement =
    placement == null ? undefined : assertPlacement(placement)
  if (nextPlacement != null && !isCampaignChildTypename(block.typename))
    throw badUserInput(
      'placement applies to section children only',
      'placement'
    )
  return await prisma.$transaction(async (tx) => {
    if (nextPlacement != null && nextPlacement !== block.placement)
      await tx.campaignBlock.update({
        where: { id: block.id },
        data: { placement: nextPlacement }
      })
    const all = await getSiblings(block, tx)
    const self = all.find((candidate) => candidate.id === block.id)
    const others = all.filter((candidate) => candidate.id !== block.id)
    others.splice(Math.min(parentOrder, others.length), 0, {
      ...(self ?? { ...block, action: null }),
      placement: nextPlacement ?? block.placement
    })
    const siblings = await reorderSiblings(others, tx)
    await touchCampaign(tx, block.campaignId)
    return siblings
  })
}

export interface CampaignBlockIdMap {
  oldId: string
  newId: string
}

/**
 * A block and everything it owns, parents before children: descendants by
 * `parentBlockId` and owned blocks through the slot columns, from the live
 * block list.
 */
export function collectSubtree(
  rootId: string,
  live: CampaignBlockWithAction[]
): CampaignBlockWithAction[] {
  const byId = new Map(live.map((row) => [row.id, row]))
  const result: CampaignBlockWithAction[] = []
  const seen = new Set<string>()
  const queue = [rootId]
  while (queue.length > 0) {
    const id = queue.shift() as string
    if (seen.has(id)) continue
    const row = byId.get(id)
    if (row == null) continue
    seen.add(id)
    result.push(row)
    for (const owned of [row.coverBlockId, row.mediaBlockId, row.logoBlockId])
      if (owned != null) queue.push(owned)
    for (const child of live)
      if (child.parentBlockId === id) queue.push(child.id)
  }
  return result
}

const SLOT_COLUMNS = ['coverBlockId', 'mediaBlockId', 'logoBlockId'] as const

/** A copied row's columns: everything but identity, timestamps, slots and the action. */
function copyColumns(
  row: CampaignBlockWithAction
): Omit<
  Prisma.CampaignBlockUncheckedCreateInput,
  'id' | 'parentBlockId' | 'parentOrder'
> {
  const data: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(row)) {
    if (
      key === 'id' ||
      key === 'parentBlockId' ||
      key === 'parentOrder' ||
      key === 'updatedAt' ||
      key === 'deletedAt' ||
      key === 'action' ||
      (SLOT_COLUMNS as readonly string[]).includes(key)
    )
      continue
    data[key] =
      key.endsWith('Translations') && value === null ? Prisma.DbNull : value
  }
  return data as Omit<
    Prisma.CampaignBlockUncheckedCreateInput,
    'id' | 'parentBlockId' | 'parentOrder'
  >
}

/**
 * Deep-copy a block with its children, owned blocks and actions under new
 * ids (`idMap` fixes any of them; the rest are fresh UUIDs), remapping slot
 * columns and action targets that point inside the copy, and insert the
 * copy directly after the original. Returns the renumbered siblings (the
 * copy among them) followed by the copied descendants, so the editor cache
 * can take the whole subtree in one write.
 */
export async function duplicateBlock(
  block: CampaignBlock,
  idMap: CampaignBlockIdMap[] = []
): Promise<CampaignBlockWithAction[]> {
  if (block.parentOrder == null)
    throw conflict('an owned block cannot be duplicated on its own', 'id')
  return await prisma.$transaction(async (tx) => {
    const live = await tx.campaignBlock.findMany({
      where: { campaignId: block.campaignId, deletedAt: null },
      orderBy: { parentOrder: 'asc' },
      include: { action: true }
    })
    const subtree = collectSubtree(block.id, live)
    const ids = new Map<string, string>()
    for (const row of subtree)
      ids.set(
        row.id,
        idMap.find((entry) => entry.oldId === row.id)?.newId ?? uuidv4()
      )
    const remap = (id: string | null): string | null =>
      id == null ? null : (ids.get(id) ?? id)
    const siblings = await getSiblings(block, tx)

    const copies: CampaignBlockWithAction[] = []
    for (const row of subtree) {
      copies.push(
        await tx.campaignBlock.create({
          data: {
            ...copyColumns(row),
            id: ids.get(row.id),
            parentBlockId:
              row.id === block.id
                ? block.parentBlockId
                : remap(row.parentBlockId),
            parentOrder: row.id === block.id ? siblings.length : row.parentOrder
          },
          include: { action: true }
        })
      )
    }
    for (const [index, row] of subtree.entries()) {
      const slots: Partial<Record<(typeof SLOT_COLUMNS)[number], string>> = {}
      for (const column of SLOT_COLUMNS) {
        const target = remap(row[column])
        if (target != null) slots[column] = target
      }
      if (Object.keys(slots).length === 0 && row.action == null) continue
      copies[index] = await tx.campaignBlock.update({
        where: { id: ids.get(row.id) },
        data: {
          ...slots,
          ...(row.action != null
            ? {
                action: {
                  create: {
                    blockId: remap(row.action.blockId),
                    regionId: row.action.regionId,
                    url: row.action.url,
                    target: row.action.target
                  }
                }
              }
            : {})
        },
        include: { action: true }
      })
    }

    const copy = copies[0]
    const others = siblings.filter((candidate) => candidate.id !== copy.id)
    const original = others.findIndex((candidate) => candidate.id === block.id)
    others.splice(original + 1, 0, copy)
    const reordered = await reorderSiblings(others, tx)
    await touchCampaign(tx, block.campaignId)
    return [...reordered, ...copies.slice(1)]
  })
}

// ---------------------------------------------------------------------------
// Section style: the nine shared section fields, validated once for every
// section and chrome update mutation.
// ---------------------------------------------------------------------------

export const CAMPAIGN_BACKGROUND_KINDS = Object.values(CampaignBackgroundKind)
export const CAMPAIGN_BACKGROUND_OVERLAYS = Object.values(
  CampaignBackgroundOverlay
)

/** The six nullable hex columns of a section row. */
export const SECTION_COLOR_COLUMNS = [
  'backgroundColor',
  'headingColor',
  'textColor',
  'buttonColor',
  'buttonTextColor',
  'accentColor'
] as const
export type SectionColorColumn = (typeof SECTION_COLOR_COLUMNS)[number]

/** The owned image typename a cover slot points at (the images ticket adds its mutations). */
export const CAMPAIGN_IMAGE_TYPENAME = 'CampaignImageBlock'

export type SectionStyleInput = Partial<
  Record<SectionColorColumn, string | null | undefined>
> & {
  backgroundKind?: string | null
  backgroundOverlay?: string | null
  coverBlockId?: string | number | null
}

export type SectionStyleColumns = Partial<
  Record<SectionColorColumn, string | null>
> & {
  backgroundKind?: CampaignBackgroundKind
  backgroundOverlay?: CampaignBackgroundOverlay | null
  coverBlockId?: string | null
}

/**
 * The pure part of the section style contract: `backgroundKind` is one of
 * the six kinds and never null; `backgroundOverlay` light, medium, heavy or
 * null; the six hex columns `assertHex`-normalised or null, never `""`.
 * Omitted fields are left untouched, and the kind is written exactly as
 * given — never derived from which columns are populated — so a leftover
 * `backgroundColor` or cover survives a switch to another kind.
 */
export function sectionStyleColumns(
  input: SectionStyleInput
): SectionStyleColumns {
  const data: SectionStyleColumns = {}
  if (input.backgroundKind !== undefined) {
    if (input.backgroundKind == null)
      throw badUserInput(
        `backgroundKind must be one of ${CAMPAIGN_BACKGROUND_KINDS.join(', ')}`,
        'backgroundKind'
      )
    data.backgroundKind = assertEnum(
      input.backgroundKind,
      'backgroundKind',
      CAMPAIGN_BACKGROUND_KINDS
    )
  }
  if (input.backgroundOverlay !== undefined)
    data.backgroundOverlay = assertEnumOrNull(
      input.backgroundOverlay,
      'backgroundOverlay',
      CAMPAIGN_BACKGROUND_OVERLAYS
    )
  if (input.coverBlockId !== undefined)
    data.coverBlockId =
      input.coverBlockId == null ? null : String(input.coverBlockId)
  for (const column of SECTION_COLOR_COLUMNS) {
    const value = input[column]
    if (value === undefined) continue
    data[column] = assertHexOrNull(value, column)
  }
  return data
}

/** The two slot columns only an image fills; `mediaBlockId` also takes a video (`validateMediaSlotTarget`). */
export const CAMPAIGN_IMAGE_SLOT_COLUMNS = [
  'coverBlockId',
  'logoBlockId'
] as const
export type CampaignImageSlotColumn =
  (typeof CAMPAIGN_IMAGE_SLOT_COLUMNS)[number]

/**
 * A slot column (`coverBlockId`, `logoBlockId`) names a live
 * CampaignImageBlock of the same campaign and nothing else: `BAD_USER_INPUT`
 * with the slot column as `field`. Null clears without a lookup.
 */
export async function validateImageSlotTarget(
  imageBlockId: string | number | null | undefined,
  campaignId: string,
  field: CampaignImageSlotColumn
): Promise<string | null> {
  if (imageBlockId == null) return null
  const image = await prisma.campaignBlock.findFirst({
    where: {
      id: String(imageBlockId),
      campaignId,
      typename: CAMPAIGN_IMAGE_TYPENAME,
      deletedAt: null
    },
    select: { id: true }
  })
  if (image == null)
    throw badUserInput(
      `${field} must be a live image block of this campaign`,
      field
    )
  return image.id
}

/**
 * The shared section style helper every section and chrome update runs:
 * the pure rules above, then a given cover resolved to a live
 * CampaignImageBlock of the same campaign (`BAD_USER_INPUT` / `coverBlockId`).
 */
export async function validateSectionStyle(
  input: SectionStyleInput,
  block: Pick<CampaignBlock, 'campaignId'>
): Promise<SectionStyleColumns> {
  const data = sectionStyleColumns(input)
  if (data.coverBlockId == null) return data
  await validateImageSlotTarget(
    data.coverBlockId,
    block.campaignId,
    'coverBlockId'
  )
  return data
}

// ---------------------------------------------------------------------------
// Owned blocks: a section's background cover, the header logo and the Media
// Slot of a hero or Featured Media section — one block per slot, replaced
// rather than edited in place.
// ---------------------------------------------------------------------------

export type CampaignImageSlotName = 'cover' | 'logo' | 'media'

export type CampaignOwnedSlotColumn =
  | 'coverBlockId'
  | 'logoBlockId'
  | 'mediaBlockId'

const IMAGE_SLOT_COLUMN: Record<
  CampaignImageSlotName,
  CampaignOwnedSlotColumn
> = { cover: 'coverBlockId', logo: 'logoBlockId', media: 'mediaBlockId' }

/** The owned video typename a Media Slot may point at. */
export const CAMPAIGN_VIDEO_TYPENAME = 'CampaignVideoBlock'

/** The sections with a Media Slot (`mediaBlockId`). */
export const CAMPAIGN_MEDIA_OWNER_TYPENAMES = [
  'CampaignHeroBlock',
  'CampaignFeaturedMediaBlock'
] as const

/** What a Media Slot holds: a Campaign Video or a Campaign Image. */
export const CAMPAIGN_MEDIA_TYPENAMES = [
  CAMPAIGN_VIDEO_TYPENAME,
  CAMPAIGN_IMAGE_TYPENAME
] as const

export function isCampaignMediaOwnerTypename(typename: string): boolean {
  return (CAMPAIGN_MEDIA_OWNER_TYPENAMES as readonly string[]).includes(
    typename
  )
}

/**
 * An owned block's parent is a live section or chrome block of the same
 * campaign (`BAD_USER_INPUT` / `parentBlockId`). Returns it so the owned
 * block can copy its scoping down.
 */
export async function validateImageOwner(
  parentBlockId: string,
  campaignId: string
): Promise<CampaignBlock> {
  const owner = await prisma.campaignBlock.findFirst({
    where: { id: parentBlockId, campaignId, deletedAt: null }
  })
  if (owner == null || !isCampaignHostTypename(owner.typename))
    throw badUserInput(
      'parentBlockId must be a section or chrome block of this campaign',
      'parentBlockId'
    )
  return owner
}

/**
 * Only a hero or a Featured Media section has a Media Slot: any other owner
 * is `BAD_USER_INPUT` with the slot column, `mediaBlockId`, as the field.
 */
export function assertMediaOwner(owner: Pick<CampaignBlock, 'typename'>): void {
  if (!isCampaignMediaOwnerTypename(owner.typename))
    throw badUserInput(
      'only a hero or Featured Media section has a media slot',
      'mediaBlockId'
    )
}

/**
 * The slot an owned image fills, `cover` when omitted. Every section and
 * chrome block has a cover; only the header has a logo (`BAD_USER_INPUT` /
 * `logoBlockId`) and only a hero or Featured Media section a media slot
 * (`BAD_USER_INPUT` / `mediaBlockId`) — the slot column is the field.
 */
export function assertImageSlot(
  owner: Pick<CampaignBlock, 'typename'>,
  slot: string | null | undefined
): CampaignImageSlotName {
  const name = assertEnum(slot ?? 'cover', 'slot', [
    'cover',
    'logo',
    'media'
  ] as const)
  if (name === 'logo' && owner.typename !== 'CampaignHeaderBlock')
    throw badUserInput('only the header has a logo', 'logoBlockId')
  if (name === 'media') assertMediaOwner(owner)
  return name
}

/**
 * Create an owned block inside `tx`: `parentOrder: null`, the owner's
 * scoping copied down, the owner's slot column pointed at the new row, and
 * the block the slot held before soft-deleted (block restore brings it back
 * as a row; a Media Slot update brings it back as the slot's block). Returns
 * the new block.
 */
export async function createOwnedBlock(
  tx: Prisma.TransactionClient,
  owner: CampaignBlock,
  column: CampaignOwnedSlotColumn,
  data: CampaignChildCreateData
): Promise<CampaignBlockWithAction> {
  const previousId = owner[column]
  if (previousId != null)
    await tx.campaignBlock.update({
      where: { id: previousId },
      data: { deletedAt: new Date() }
    })
  const block = await tx.campaignBlock.create({
    data: {
      ...data,
      campaignId: owner.campaignId,
      pageId: owner.pageId,
      regionId: owner.regionId,
      parentBlockId: owner.id,
      parentOrder: null
    },
    include: { action: true }
  })
  await tx.campaignBlock.update({
    where: { id: owner.id },
    data: { [column]: block.id }
  })
  await touchCampaign(tx, owner.campaignId)
  return block
}

/** `createOwnedBlock` for a CampaignImageBlock in the named slot. */
export async function createOwnedImageBlock(
  tx: Prisma.TransactionClient,
  owner: CampaignBlock,
  slot: CampaignImageSlotName,
  data: Omit<CampaignChildCreateData, 'typename'>
): Promise<CampaignBlockWithAction> {
  return await createOwnedBlock(tx, owner, IMAGE_SLOT_COLUMN[slot], {
    ...data,
    typename: CAMPAIGN_IMAGE_TYPENAME
  })
}

/**
 * `mediaBlockId` on a hero or Featured Media update names a
 * CampaignVideoBlock or CampaignImageBlock that section owns — live, or
 * soft-deleted by an earlier swap so undo can bring it back. Anything else
 * is `BAD_USER_INPUT` / `mediaBlockId`. Null empties the slot without a
 * lookup; omitted leaves it alone.
 */
export async function validateMediaSlotTarget(
  mediaBlockId: string | number | null | undefined,
  owner: Pick<CampaignBlock, 'id' | 'campaignId'>
): Promise<string | null | undefined> {
  if (mediaBlockId === undefined) return undefined
  if (mediaBlockId == null) return null
  const media = await prisma.campaignBlock.findFirst({
    where: {
      id: String(mediaBlockId),
      campaignId: owner.campaignId,
      parentBlockId: owner.id
    },
    select: { id: true, typename: true }
  })
  if (
    media == null ||
    !(CAMPAIGN_MEDIA_TYPENAMES as readonly string[]).includes(media.typename)
  )
    throw badUserInput(
      'mediaBlockId must be a video or image block owned by this section',
      'mediaBlockId'
    )
  return media.id
}

/**
 * Point the Media Slot at `mediaBlockId`, or empty it, inside `tx`, keeping
 * 0 or 1 live block in the slot: the block it held is soft-deleted and the
 * new one restored if an earlier swap deleted it. The owner's column itself
 * is written by the caller's update.
 */
export async function swapMediaSlot(
  tx: Prisma.TransactionClient,
  owner: Pick<CampaignBlock, 'mediaBlockId'>,
  mediaBlockId: string | null
): Promise<void> {
  if (owner.mediaBlockId != null && owner.mediaBlockId !== mediaBlockId)
    await tx.campaignBlock.update({
      where: { id: owner.mediaBlockId },
      data: { deletedAt: new Date() }
    })
  if (mediaBlockId != null)
    await tx.campaignBlock.update({
      where: { id: mediaBlockId },
      data: { deletedAt: null }
    })
}
