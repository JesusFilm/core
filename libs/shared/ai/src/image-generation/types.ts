export interface ImageGenerationRequest {
  prompt: string
  image?: string // Base64 encoded image for image-to-image generation
  aspectRatio?: string
  quality?: 'standard' | 'hd'
  seed?: number
}

export interface ImageGenerationResponse {
  images: Array<{
    url: string
    width: number
    height: number
    format: string
  }>
  metadata?: {
    model: string
    prompt: string
    generationTime: number
  }
}

export interface ToolsVisualsTarget {
  id: string
  label: string
  width: number
  height: number
  aspectRatio: string
}

export interface ToolsVisualsResult {
  id: string
  url: string
  width: number
  height: number
  format: string
  targetId: string
  shortlisted: boolean
  createdAt: Date
}

