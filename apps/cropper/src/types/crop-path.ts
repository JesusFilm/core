import type { CropKeyframe } from './crop-keyframe'

export interface CropBox {
  x: number
  y: number
  width: number
  height: number
}

export interface CropPath {
  id: string
  videoSlug: string
  aspectRatio: number
  padding: number
  smoothing: number
  keyframes: CropKeyframe[]
  createdAt: string
  updatedAt: string
}
