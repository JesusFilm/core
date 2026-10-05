import { GraphQLError } from 'graphql'

import {
  CampaignAction,
  CampaignBlock,
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
import { assertEnum, badUserInput } from '../validation'

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
  'CampaignHeaderBlock',
  'CampaignFooterBlock'
] as const

/** Chrome is never deleted, moved or duplicated. */
export const CAMPAIGN_CHROME_TYPENAMES = [
  'CampaignHeaderBlock',
  'CampaignFooterBlock'
] as const

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

function notFound(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } })
}

function forbidden(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } })
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
  const block = await prisma.campaignBlock.findFirst({
    where: {
      id: blockId,
      ...(options.includeDeleted === true ? {} : { deletedAt: null })
    },
    include: INCLUDE_CAMPAIGN_BLOCK_ACL
  })
  if (block == null) throw notFound('block not found')
  if (!campaignAcl(Action.Update, block.campaign, user))
    throw forbidden('user is not allowed to update block')
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

/** Write validated columns to a block and bump its campaign. */
export async function updateBlock(
  block: Pick<CampaignBlock, 'id' | 'campaignId'>,
  data: Prisma.CampaignBlockUncheckedUpdateInput
): Promise<CampaignBlockWithAction> {
  return await prisma.$transaction(async (tx) => {
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
