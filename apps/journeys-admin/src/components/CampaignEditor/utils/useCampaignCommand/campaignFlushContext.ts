import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { regionLines } from '../../CampaignEditorProvider'
import { subtreeOf } from '../subtreeOf'

/** A block, or a region (`CampaignRegion`), whose subtree's pending text a step flushes. */
export interface CampaignFlushTarget {
  __typename: string
  id: string
}

/** Spread into a request's `context`: the DebounceLink forwards the subtree's pending text first. */
export interface CampaignFlushContext {
  debounceFlushPrefix?: string[]
}

/**
 * The debounce key that groups one field's keystrokes into one request; a
 * translation edit is keyed by its language too.
 */
export function textDebounceKey(
  target: { __typename: string; id: string },
  field: string,
  languageId?: string | null
): string {
  const base = `${textDebounceKeyPrefix(target)}${field}`
  return languageId == null ? base : `${base}:${languageId}`
}

/** The prefix shared by the debounce keys of every field of one block. */
export function textDebounceKeyPrefix(target: {
  __typename: string
  id: string
}): string {
  return `${target.__typename}:${target.id}:`
}

/**
 * The request context that flushes the pending text of a block and
 * everything it owns (its Extras, slotted sections and their Extras), or of
 * a region's Region Lines, before the request itself: one debounce-key
 * prefix per block. Without a target it is empty.
 */
export function campaignFlushContext(
  blocks: CampaignBlock[],
  target?: CampaignFlushTarget
): CampaignFlushContext {
  if (target == null) return {}
  const roots: CampaignFlushTarget[] =
    target.__typename === 'CampaignRegion'
      ? regionLines(blocks, target.id)
      : [target]
  const prefixes = new Set<string>()
  for (const root of roots) {
    prefixes.add(textDebounceKeyPrefix(root))
    for (const row of subtreeOf(blocks, root.id))
      prefixes.add(textDebounceKeyPrefix(row))
  }
  return { debounceFlushPrefix: [...prefixes] }
}
