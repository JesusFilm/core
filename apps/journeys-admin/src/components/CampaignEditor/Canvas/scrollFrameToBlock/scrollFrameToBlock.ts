/**
 * Scrolls the frame's own scroller the least distance that brings a block
 * (found by its DOM id, which is its block id) into view. It moves that
 * scroller and nothing else: `scrollIntoView` and `focus()` also scroll every
 * ancestor, which would move the editor page that holds the frame. Rects read
 * inside the frame are unscaled, so no scale correction is needed.
 */
export function scrollFrameToBlock(
  frameDocument: Document,
  blockId: string
): void {
  const target = frameDocument.getElementById(blockId)
  const scroller = target?.closest<HTMLElement>(
    '[data-testid="CampaignCanvasPage"]'
  )
  if (target == null || scroller == null) return

  const targetRect = target.getBoundingClientRect()
  const scrollerRect = scroller.getBoundingClientRect()
  if (targetRect.top < scrollerRect.top) {
    scroller.scrollTop -= scrollerRect.top - targetRect.top
    return
  }
  const hidden = targetRect.bottom - scrollerRect.bottom
  if (hidden <= 0) return
  const room = targetRect.top - scrollerRect.top
  scroller.scrollTop += Math.min(hidden, room)
}
