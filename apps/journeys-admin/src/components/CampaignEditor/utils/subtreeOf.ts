import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'

/** The block columns that own a slotted block: a cover, a media or a logo. */
export const SLOT_COLUMNS = [
  'coverBlockId',
  'mediaBlockId',
  'logoBlockId'
] as const

/** A block and everything it owns, parents first, from the cached list. */
export function subtreeOf(
  blocks: CampaignBlock[],
  rootId: string
): CampaignBlock[] {
  const byId = new Map(blocks.map((block) => [block.id, block]))
  const result: CampaignBlock[] = []
  const seen = new Set<string>()
  const queue = [rootId]
  while (queue.length > 0) {
    const id = queue.shift() as string
    if (seen.has(id)) continue
    const row = byId.get(id)
    if (row == null) continue
    seen.add(id)
    result.push(row)
    const columns = row as unknown as Record<string, unknown>
    for (const column of SLOT_COLUMNS) {
      const owned = columns[column]
      if (typeof owned === 'string') queue.push(owned)
    }
    for (const child of blocks)
      if (child.parentBlockId === id) queue.push(child.id)
  }
  return result
}
