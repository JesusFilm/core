export type CanvasView = 'desktop' | 'phone'

/** Desktop view: the frame is 1200 px wide whatever space the editor leaves it. */
export const DESKTOP_FRAME_WIDTH = 1200

/** Phone view: the frame is 390 px wide so the campaign's breakpoints follow the canvas width. */
export const PHONE_FRAME_WIDTH = 390

/** The frame is never scaled below this, so text stays legible and the campaign's `md` breakpoint (600 px) is never crossed. */
export const MIN_CANVAS_SCALE = 0.5

export function frameWidthOf(view: CanvasView): number {
  return view === 'phone' ? PHONE_FRAME_WIDTH : DESKTOP_FRAME_WIDTH
}

/**
 * The scale that fits a frame of `frameWidth` px into `availableWidth` px:
 * never above 1 (the frame is only shrunk) and never below the floor.
 */
export function canvasScale(
  availableWidth: number,
  frameWidth: number
): number {
  return Math.min(1, Math.max(MIN_CANVAS_SCALE, availableWidth / frameWidth))
}
