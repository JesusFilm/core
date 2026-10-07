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

/** Drop one block from `Campaign.blocks`; its row stays cached for restore. */
export function campaignBlocksRemove(
  cache: ApolloCache,
  campaignId: string,
  blockId: string
): void {
  cache.modify({
    id: campaignCacheId(cache, campaignId),
    fields: {
      blocks(existing: readonly Reference[] = [], { readField }) {
        return existing.filter(
          (candidate) => readField('id', candidate) !== blockId
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
