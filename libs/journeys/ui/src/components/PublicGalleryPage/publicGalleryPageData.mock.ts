import { PublicGalleryPageData, PublicGalleryPageItem } from './galleryTokens'

export const mockItem: PublicGalleryPageItem = {
  id: 'template-1',
  title: 'Sample Template',
  description: 'A sample template for testing',
  slug: 'sample-template',
  createdAt: '2026-01-01T00:00:00.000Z',
  languageName: [{ value: 'English', primary: true }],
  image: { src: 'https://example.com/image.jpg', alt: 'Sample image' }
}

export function makeData(
  overrides: Partial<PublicGalleryPageData> = {}
): PublicGalleryPageData {
  return {
    title: 'Easter Gallery 2026',
    description: 'A curated set of Easter outreach templates.',
    creatorName: 'Jane Doe',
    creatorImageSrc: 'https://example.com/avatar.jpg',
    creatorImageAlt: 'Jane Doe avatar',
    mediaUrl: null,
    items: [mockItem],
    ...overrides
  }
}

export function makeItems(count: number): PublicGalleryPageItem[] {
  return Array.from({ length: count }, (_, index) => ({
    ...mockItem,
    id: `template-${index}`,
    slug: `template-${index}`
  }))
}
