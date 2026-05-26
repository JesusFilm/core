import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { PublicGalleryPage, PublicGalleryPageData } from './PublicGalleryPage'

/**
 * The public gallery (template-collection) page, shared by the live
 * journeys app and the admin collection dialog. `variant="journey"` renders
 * the real full-screen sectioned page; `variant="admin"` renders the
 * compact recreation shown inside the admin dialog. `prefers-reduced-motion`
 * disables the journey-view animations.
 */
const meta: Meta<typeof PublicGalleryPage> = {
  ...journeysAdminConfig,
  component: PublicGalleryPage,
  title: 'Journeys-Ui/PublicGalleryPage',
  parameters: {
    ...journeysAdminConfig.parameters,
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

const gallery: PublicGalleryPageData = {
  title: 'Easter Gallery 2026',
  description:
    'A curated set of Easter outreach templates — invites, devotionals and service graphics ready to customise.',
  creatorName: 'Jane Doe',
  creatorImageSrc:
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
  creatorImageAlt: 'Jane Doe',
  mediaUrl: null,
  items: Array.from({ length: 7 }, (_, index) => ({
    id: `template-${index}`,
    title: TITLES[index % TITLES.length],
    description:
      'A ready-to-use outreach template you can customise and share in minutes.',
    slug: `template-${index}`,
    createdAt: '2026-03-01T00:00:00.000Z',
    languageName: [{ value: 'English', primary: true }],
    image: {
      src: `https://images.unsplash.com/${IMAGES[index % IMAGES.length]}?w=800&q=80`,
      alt: TITLES[index % TITLES.length]
    }
  }))
}

type Story = StoryObj<typeof PublicGalleryPage>

export const Journey: Story = {
  args: { variant: 'journey', data: gallery }
}

/** Compact recreation, rendered inside an admin-dialog-sized frame. */
export const Admin: Story = {
  args: { variant: 'admin', data: gallery },
  render: (args) => (
    <Box sx={{ width: 287, p: 2.5, bgcolor: 'background.paper' }}>
      <PublicGalleryPage {...args} />
    </Box>
  )
}

export default meta
