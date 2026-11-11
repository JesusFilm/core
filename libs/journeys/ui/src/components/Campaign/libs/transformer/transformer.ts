import sortBy from 'lodash/sortBy'

/** The columns the tree transform reads from any public campaign block. */
export interface CampaignFlatBlock {
  __typename: string
  id: string
  parentBlockId: string | null
  parentOrder: number | null
  deletedAt?: string | null
  coverBlockId?: string | null
  mediaBlockId?: string | null
  logoBlockId?: string | null
}

export type CampaignTreeBlock<T extends CampaignFlatBlock = CampaignFlatBlock> =
  T & {
    /** Ordered children (Extras, items, slots) by parentOrder. */
    children: Array<CampaignTreeBlock<T>>
    /** The owned background cover (`coverBlockId`), when present. */
    cover: CampaignTreeBlock<T> | null
    /** The owned Media Slot block (`mediaBlockId`), when present. */
    media: CampaignTreeBlock<T> | null
    /** The owned header logo (`logoBlockId`), when present. */
    logo: CampaignTreeBlock<T> | null
  }

/**
 * Tree the flat public block list as the journey transform does: children by
 * `parentBlockId` ordered by `parentOrder`; owned blocks (`parentOrder: null`)
 * attached through the slot column that names them rather than as children;
 * soft-deleted rows dropped. Returns the roots (sections, chrome, lines) in
 * order.
 */
export function transformCampaignBlocks<T extends CampaignFlatBlock>(
  blocks: T[]
): Array<CampaignTreeBlock<T>> {
  const live = blocks.filter((block) => block.deletedAt == null)
  const nodes = new Map<string, CampaignTreeBlock<T>>()
  for (const block of live) {
    nodes.set(block.id, {
      ...block,
      children: [],
      cover: null,
      media: null,
      logo: null
    })
  }

  const roots: Array<CampaignTreeBlock<T>> = []
  const ownedIds = new Set<string>()
  for (const node of nodes.values()) {
    for (const slot of ['cover', 'media', 'logo'] as const) {
      const ownedId = node[`${slot}BlockId`]
      if (ownedId == null) continue
      const owned = nodes.get(ownedId)
      if (owned == null) continue
      node[slot] = owned
      ownedIds.add(ownedId)
    }
  }

  for (const node of sortBy([...nodes.values()], 'parentOrder')) {
    if (ownedIds.has(node.id)) continue
    if (node.parentOrder == null) continue
    const parent =
      node.parentBlockId == null ? undefined : nodes.get(node.parentBlockId)
    if (parent != null) {
      parent.children.push(node)
      continue
    }
    if (node.parentBlockId == null) roots.push(node)
  }

  return roots
}
