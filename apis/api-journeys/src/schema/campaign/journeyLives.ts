import {
  CampaignJourneyLive,
  loadJourneyLivesByIds
} from './block/campaignJourneyBlock'

/** The live journey read of every journey card, by journey id. */
export type JourneyLives = ReadonlyMap<string, CampaignJourneyLive>

/** The columns that make a block a journey card and name its journey. */
interface JourneyCardColumns {
  typename: string
  journeyId: string | null
}

/**
 * Read the live status, address and image of every journey the blocks'
 * journey cards link, in one query.
 */
export async function loadJourneyLivesOfBlocks(
  blocks: JourneyCardColumns[]
): Promise<JourneyLives> {
  return await loadJourneyLivesByIds(
    blocks.flatMap((block) =>
      block.typename === 'CampaignJourneyBlock' && block.journeyId != null
        ? [block.journeyId]
        : []
    )
  )
}

/**
 * A journey card with its live journey read attached (null when it links no
 * journey, or one that no longer exists); any other block as it is.
 */
export function withJourneyLive<Block extends JourneyCardColumns>(
  block: Block,
  lives: JourneyLives
): Block | (Block & { journeyLive: CampaignJourneyLive | null }) {
  if (block.typename !== 'CampaignJourneyBlock') return block
  return {
    ...block,
    journeyLive:
      block.journeyId == null ? null : (lives.get(block.journeyId) ?? null)
  }
}
