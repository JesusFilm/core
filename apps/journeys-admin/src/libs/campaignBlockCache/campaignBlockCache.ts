import { ApolloCache, Reference } from '@apollo/client'

export type CampaignBlockRef = {
  __typename: string
  id: string
}

export type CampaignBlockOrder = CampaignBlockRef & {
  parentOrder: number | null
}

/**
 * The editor keeps every live block in `Campaign.blocks` (the flat list the
 * `campaign` query returns). Create, delete and restore each adjust that list
 * so the canvas re-trees without a refetch; the block rows themselves are
 * normalised from the mutation results and optimistic responses.
 */

function campaignCacheId(
  cache: ApolloCache,
  campaignId: string
): string | undefined {
  return cache.identify({ __typename: 'Campaign', id: campaignId })
}

/** Append blocks to `Campaign.blocks`, skipping any already listed. */
export function campaignBlocksAdd(
  cache: ApolloCache,
  campaignId: string,
  blocks: CampaignBlockRef[]
): void {
  cache.modify({
    id: campaignCacheId(cache, campaignId),
    fields: {
      blocks(existing: readonly Reference[] = [], { toReference }) {
        const added: Reference[] = []
        for (const block of blocks) {
          const ref = toReference(block)
          if (ref == null) continue
          if (existing.some((candidate) => candidate.__ref === ref.__ref))
            continue
          added.push(ref)
        }
        return [...existing, ...added]
      }
    }
  })
}

const SLOT_COLUMNS: readonly CampaignSlotColumn[] = [
  'coverBlockId',
  'mediaBlockId',
  'logoBlockId'
]

/**
 * Drop a block from `Campaign.blocks` with every row reachable from it
 * through `parentBlockId` and the slot columns, as the API soft-deletes
 * them together. The rows stay cached for restore.
 */
export function campaignBlocksRemove(
  cache: ApolloCache,
  campaignId: string,
  blockId: string
): void {
  cache.modify({
    id: campaignCacheId(cache, campaignId),
    fields: {
      blocks(existing: readonly Reference[] = [], { readField }) {
        const removed = new Set([blockId])
        let grew = true
        while (grew) {
          grew = false
          for (const candidate of existing) {
            const id = readField<string>('id', candidate)
            if (id == null) continue
            const parentBlockId = readField<string | null>(
              'parentBlockId',
              candidate
            )
            if (
              !removed.has(id) &&
              parentBlockId != null &&
              removed.has(parentBlockId)
            ) {
              removed.add(id)
              grew = true
            }
            if (!removed.has(id)) continue
            for (const column of SLOT_COLUMNS) {
              const owned = readField<string | null>(column, candidate)
              if (owned == null || removed.has(owned)) continue
              removed.add(owned)
              grew = true
            }
          }
        }
        return existing.filter(
          (candidate) => !removed.has(readField<string>('id', candidate) ?? '')
        )
      }
    }
  })
}

/** Write the renumbered `parentOrder` the API returned onto each sibling row. */
export function campaignBlocksReorder(
  cache: ApolloCache,
  blocks: CampaignBlockOrder[]
): void {
  for (const block of blocks) {
    cache.modify({
      id: cache.identify(block),
      fields: {
        parentOrder() {
          return block.parentOrder
        }
      }
    })
  }
}

export function campaignBlockCreateUpdate(
  cache: ApolloCache,
  campaignId: string,
  block: CampaignBlockRef | null | undefined
): void {
  if (block == null) return
  campaignBlocksAdd(cache, campaignId, [block])
}

export function campaignBlockDeleteUpdate(
  cache: ApolloCache,
  campaignId: string,
  blockId: string,
  siblings: CampaignBlockOrder[] | null | undefined
): void {
  if (siblings == null) return
  campaignBlocksReorder(cache, siblings)
  campaignBlocksRemove(cache, campaignId, blockId)
}

export function campaignBlockRestoreUpdate(
  cache: ApolloCache,
  campaignId: string,
  blocks: CampaignBlockOrder[] | null | undefined
): void {
  if (blocks == null) return
  campaignBlocksReorder(cache, blocks)
  campaignBlocksAdd(cache, campaignId, blocks)
}

/**
 * The columns of a block that owns another (a section's cover or Media
 * Slot, the header's logo, a carousel's item): the scoping the new block
 * copies.
 */
export type CampaignBlockOwnerRef = CampaignBlockRef & {
  campaignId: string
  pageId: string | null
  regionId: string | null
}

/** The scoping columns that decide which cached blocks are a block's siblings. */
export type CampaignBlockScopeRef = CampaignBlockRef & {
  pageId: string | null
  regionId: string | null
  parentBlockId: string | null
  parentOrder: number | null
}

/**
 * Insert a block into `Campaign.blocks` at its own `parentOrder`: the
 * siblings at or after that position shift down by one, as the API
 * renumbered them. An appended block (nothing after it) shifts nothing.
 */
export function campaignBlocksInsert(
  cache: ApolloCache,
  campaignId: string,
  block: CampaignBlockScopeRef
): void {
  const shifted: CampaignBlockOrder[] = []
  cache.modify({
    id: campaignCacheId(cache, campaignId),
    fields: {
      blocks(existing: readonly Reference[] = [], { readField, toReference }) {
        if (block.parentOrder != null) {
          for (const candidate of existing) {
            const id = readField<string>('id', candidate)
            const parentOrder = readField<number | null>(
              'parentOrder',
              candidate
            )
            if (
              id == null ||
              id === block.id ||
              parentOrder == null ||
              parentOrder < block.parentOrder ||
              (readField<string | null>('parentBlockId', candidate) ?? null) !==
                block.parentBlockId ||
              (readField<string | null>('pageId', candidate) ?? null) !==
                block.pageId ||
              (readField<string | null>('regionId', candidate) ?? null) !==
                block.regionId
            )
              continue
            shifted.push({
              __typename: readField<string>('__typename', candidate) ?? '',
              id,
              parentOrder: parentOrder + 1
            })
          }
        }
        const ref = toReference(block)
        if (
          ref == null ||
          existing.some((candidate) => candidate.__ref === ref.__ref)
        )
          return existing
        return [...existing, ref]
      }
    }
  })
  campaignBlocksReorder(cache, shifted)
}

export function campaignBlockInsertUpdate(
  cache: ApolloCache,
  campaignId: string,
  block: CampaignBlockScopeRef | null | undefined
): void {
  if (block == null) return
  campaignBlocksInsert(cache, campaignId, block)
}

/** The slot columns a create points at its new owned block on the server. */
export type CampaignSlotColumn = 'coverBlockId' | 'mediaBlockId' | 'logoBlockId'

/**
 * Point an owner's slot column at a block in the cache, as the create that
 * filled the slot did on the server, so the canvas trees the new block into
 * the slot with the create's optimistic response.
 */
export function campaignBlockSlotWrite(
  cache: ApolloCache,
  owner: CampaignBlockRef,
  column: CampaignSlotColumn,
  blockId: string
): void {
  cache.modify({
    id: cache.identify(owner),
    fields: {
      [column]() {
        return blockId
      }
    }
  })
}
