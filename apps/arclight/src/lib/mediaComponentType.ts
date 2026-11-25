/**
 * A media component is playable content only when its Variant has a stream
 * URL (HLS or DASH — a Variant may carry only one of the two). Generated
 * parent Variants (empty placeholders for a series or collection) are stored
 * with `hls: ''` rather than null, so an empty string must count as no
 * media; otherwise they surface as 0-length content.
 */
export function getComponentType(
  hls: string | null | undefined,
  dash: string | null | undefined
): 'content' | 'container' {
  return hls || dash ? 'content' : 'container'
}
