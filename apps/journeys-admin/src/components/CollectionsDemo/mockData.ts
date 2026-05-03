export { MOCK_TEMPLATES } from '../FoldersDemo/mockData'

// Shared layout constants
export const TEMPLATE_CARD_CONTENT_HEIGHT = 80
export const TEMPLATE_CARD_IMAGE_HEIGHT = 140 // approx at typical grid width
export const TEMPLATE_CARD_HEIGHT =
  TEMPLATE_CARD_IMAGE_HEIGHT + TEMPLATE_CARD_CONTENT_HEIGHT + 14
export const SECTION_HEADER_HEIGHT = 48
export const SECTION_PADDING = 48 // p: 3 = 24px * 2

export const COLLECTION_CARD_MOSAIC_RATIO = 1.4
export const COLLECTION_CARD_INFO_HEIGHT = 76
export const COLLECTION_CARD_HEIGHT = 180 + COLLECTION_CARD_INFO_HEIGHT // mosaic approx + info

export const COLLECTION_CARD_WIDTHS = {
  xs: '100%',
  sm: 'calc(50% - 6px)',
  md: 'calc(33.333% - 8px)',
  lg: 'calc(25% - 9px)',
  xl: 'calc(20% - 10px)'
}
export type { MockTemplate } from '../FoldersDemo/mockData'

export interface Collection {
  id: string
  title: string
  description: string
  pageDescription: string
  creatorName: string
  creatorImageUrl: string
  pdfVideoUrl: string
  templateIds: string[]
  backgroundColor: string
  isPublished: boolean
}

export const PASTEL_PALETTE = [
  '#E8F5E9', // mint green
  '#E3F2FD', // light blue
  '#FFF3E0', // peach
  '#F3E5F5', // lavender
  '#FFF9C4', // lemon
  '#FCE4EC', // blush pink
  '#E0F7FA', // pale cyan
  '#F1F8E9', // lime cream
  '#EDE7F6', // soft violet
  '#FBE9E7' // warm coral
]

export function getNextPastelColor(usedColors: Set<string>): string {
  const unused = PASTEL_PALETTE.filter((c) => !usedColors.has(c))
  if (unused.length > 0) {
    return unused[Math.floor(Math.random() * unused.length)]
  }
  return PASTEL_PALETTE[Math.floor(Math.random() * PASTEL_PALETTE.length)]
}
