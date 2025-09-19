export type CropEasing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'

export interface CropWindow {
  /** Horizontal focus point in the source video (0 - left, 1 - right). */
  focusX: number
  /** Vertical focus point in the source video (0 - top, 1 - bottom). */
  focusY: number
  /**
   * Portion of the source height to keep in the crop window.
   * 1 = full height, lower values zoom in.
   */
  scale: number
}

export interface CropKeyframe {
  id: string
  time: number
  window: CropWindow
  easing: CropEasing
  locked?: boolean
  createdAt: string
  updatedAt: string
}
