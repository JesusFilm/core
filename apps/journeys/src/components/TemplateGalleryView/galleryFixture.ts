import {
  GetTemplateGalleryPage_templateGalleryPageBySlug_templates as GalleryTemplate,
  GetTemplateGalleryPage_templateGalleryPageBySlug as TemplateGalleryPage
} from '../../../__generated__/GetTemplateGalleryPage'

export const mockTemplate: GalleryTemplate = {
  __typename: 'Journey',
  id: 'template-1',
  title: 'Sample Template',
  description: 'A sample template for testing',
  slug: 'sample-template',
  createdAt: '2026-01-01T00:00:00.000Z',
  template: true,
  customizable: false,
  website: false,
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  primaryImageBlock: {
    __typename: 'ImageBlock',
    id: 'image-1',
    src: 'https://example.com/image.jpg',
    alt: 'Sample image',
    width: 800,
    height: 600,
    blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH'
  }
}

export function makeGallery(
  overrides: Partial<TemplateGalleryPage> = {}
): TemplateGalleryPage {
  return {
    __typename: 'TemplateGalleryPage',
    id: 'gallery-1',
    slug: 'easter-2026',
    title: 'Easter Gallery 2026',
    description: 'A curated set of Easter outreach templates.',
    creatorName: 'Jane Doe',
    mediaUrl: null,
    publishedAt: '2026-04-01T00:00:00.000Z',
    creatorImageBlock: {
      __typename: 'ImageBlock',
      id: 'creator-img-1',
      src: 'https://example.com/avatar.jpg',
      alt: 'Jane Doe avatar',
      width: 96,
      height: 96,
      blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH'
    },
    templates: [mockTemplate],
    ...overrides
  }
}
