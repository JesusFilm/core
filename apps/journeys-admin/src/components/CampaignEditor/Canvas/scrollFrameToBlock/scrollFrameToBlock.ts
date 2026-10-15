/**
 * Scrolls the frame's own scroller the least distance that brings a block
 * (found by its DOM id, which is its block id) into view. It moves that
 * scroller and nothing else: `scrollIntoView` and `focus()` also scroll every
 * ancestor, which would move the editor page that holds the frame. Rects read
 * inside the frame are unscaled, so no scale correction is needed. The
 * block's `scroll-margin-top` is kept clear at the top, so a section is not
 * left under the sticky header.
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
  const margin =
    Number.parseFloat(
      frameDocument.defaultView?.getComputedStyle(target).scrollMarginTop ?? ''
    ) || 0
  const clearTop = targetRect.top - margin
  if (clearTop < scrollerRect.top) {
    scroller.scrollTop -= scrollerRect.top - clearTop
    return
  }
  const hidden = targetRect.bottom - scrollerRect.bottom
  if (hidden <= 0) return
  const room = clearTop - scrollerRect.top
  scroller.scrollTop += Math.min(hidden, room)
}
