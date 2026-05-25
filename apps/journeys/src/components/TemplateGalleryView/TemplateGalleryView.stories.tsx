import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { GetTemplateGalleryPage_templateGalleryPageBySlug as TemplateGalleryPage } from '../../../__generated__/GetTemplateGalleryPage'
import { journeysConfig } from '../../libs/storybook'

import { TemplateGalleryView } from './TemplateGalleryView'

/**
 * Prototype preview for the public template-collection page. The page
 * carries a "Style preview" toggle at the top — flip between the five
 * layout presets (Showcase, Spotlight, Landing, Bento, Feature rows) to
 * compare them. This is exploratory scaffolding, not shipped UI.
 */
const meta: Meta<typeof TemplateGalleryView> = {
  ...journeysConfig,
  component: TemplateGalleryView,
  title: 'Journeys/TemplateGalleryView',
  parameters: {
    ...journeysConfig.parameters,
    layout: 'fullscreen'
  }
}

const IMAGES = [
  'photo-1490750967868-88aa4486c946',
  'photo-1506744038136-46273834b3fb',
  'photo-1518770660439-4636190af475',
  'photo-1441974231531-c6227db76b6e',
  'photo-1531297484001-80022131f5a1',
  'photo-1454372182658-c712e4c5a1db',
  'photo-1517849845537-4d257902454a'
]

const TITLES = [
  'Easter Sunday Invite',
  'Holy Week Devotional',
  'Resurrection Story',
  'Community Egg Hunt',
  'Sunrise Service',
  'New Believers Welcome',
  'Faith & Family Night'
]

// Mostly landscape (as real journey cards tend to be) with a few portrait /
// square. Images are cover-cropped into their tiles, so the mix mainly
// exercises how each layout crops different source ratios.
const DIMENSIONS = [
  { width: 1280, height: 800 },
  { width: 1280, height: 800 },
  { width: 800, height: 1100 },
  { width: 1280, height: 800 },
  { width: 900, height: 900 },
  { width: 1280, height: 800 },
  { width: 820, height: 1040 },
  { width: 1280, height: 800 },
  { width: 1280, height: 800 },
  { width: 900, height: 900 }
]

function buildTemplate(
  index: number
): TemplateGalleryPage['templates'][number] {
  const { width, height } = DIMENSIONS[index % DIMENSIONS.length]
  return {
    __typename: 'TemplateGalleryItem',
    id: `template-${index}`,
    title: TITLES[index % TITLES.length],
    description:
      'A ready-to-use outreach template you can customise and share in minutes.',
    slug: `template-${index}`,
    createdAt: '2026-03-01T00:00:00.000Z',
    template: true,
    customizable: false,
    website: false,
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      name: [{ __typename: 'LanguageName', value: 'English', primary: true }]
    },
    primaryImageBlock: {
      __typename: 'ImageBlock',
      id: `image-${index}`,
      src: `https://images.unsplash.com/${IMAGES[index % IMAGES.length]}?w=800&q=80`,
      alt: TITLES[index % TITLES.length],
      width,
      height,
      blurhash: ''
    }
  }
}

const gallery: TemplateGalleryPage = {
  __typename: 'TemplateGalleryPage',
  id: 'gallery-1',
  slug: 'easter-2026',
  title: 'Easter Gallery 2026',
  description:
    'A curated set of Easter outreach templates — invites, devotionals and service graphics ready to customise.',
  creatorName: 'Jane Doe',
  mediaUrl: null,
  publishedAt: '2026-04-01T00:00:00.000Z',
  creatorImageSrc: `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80`,
  creatorImageAlt: 'Jane Doe',
  templates: Array.from({ length: 10 }, (_, index) => buildTemplate(index))
}

type Story = StoryObj<typeof TemplateGalleryView>

export const Default: Story = {
  args: { gallery }
}

export default meta
