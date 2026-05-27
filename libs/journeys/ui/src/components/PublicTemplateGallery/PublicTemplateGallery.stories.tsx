import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { PublicGalleryPageData } from '../PublicGalleryPage'

import { PublicTemplateGallery } from './PublicTemplateGallery'

const PublicTemplateGalleryStory: Meta<typeof PublicTemplateGallery> = {
  ...journeysAdminConfig,
  component: PublicTemplateGallery,
  title: 'Journeys-Ui/PublicTemplateGallery',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const galleryData: PublicGalleryPageData = {
  title: 'Digital invitation for events',
  description:
    'The templates include event details, a short description, and a built-in registration form. Easy to customize for your event and share.\n\nIf you have any questions, feel free to email me vovan85@gmail.com.',
  creatorName: 'Konstantin Konstantinov',
  creatorImageSrc:
    'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=128&q=80',
  creatorImageAlt: 'Konstantin Konstantinov',
  mediaUrl:
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=80',
  items: [
    {
      id: 'king-of-kings',
      title: 'King of Kings',
      description:
        'A digital invitation for a movie screening. The template includes event details, a description, and a registration form.',
      slug: 'king-of-kings',
      createdAt: '2022-07-01T00:00:00.000Z',
      languageName: [{ value: 'English', primary: true }],
      image: {
        src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
        alt: 'King of Kings'
      }
    },
    {
      id: 'valentines-quiz-battle',
      title: 'Valentine’s Quiz Battle',
      description:
        'Valentine’s Day event featuring a Girls vs Boys Quiz Battle.',
      slug: 'valentines-quiz-battle',
      createdAt: '2023-02-01T00:00:00.000Z',
      languageName: [
        { value: 'Español', primary: true },
        { value: 'Spanish', primary: false }
      ],
      image: {
        src: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&q=80',
        alt: 'Valentine’s Quiz Battle'
      }
    },
    {
      id: 'easter-celebration',
      title: 'Easter Celebration',
      description: 'Invite your community to a joyful Easter gathering.',
      slug: 'easter-celebration',
      createdAt: '2024-03-01T00:00:00.000Z',
      languageName: [{ value: 'Français', primary: true }],
      image: {
        src: 'https://images.unsplash.com/photo-1521478706270-f2e33c203d95?w=600&q=80',
        alt: 'Easter Celebration'
      }
    },
    {
      id: 'community-meetup',
      title: 'Community Meetup',
      description: null,
      slug: 'community-meetup',
      createdAt: null,
      languageName: [],
      image: null
    }
  ]
}

type Story = StoryObj<typeof PublicTemplateGallery>

export const Default: Story = {
  render: () => <PublicTemplateGallery data={galleryData} />
}

export const AdminPreview: Story = {
  render: () => <PublicTemplateGallery data={galleryData} variant="admin" />
}

export const Empty: Story = {
  render: () => (
    <PublicTemplateGallery
      data={{ ...galleryData, mediaUrl: null, items: [] }}
    />
  )
}

export default PublicTemplateGalleryStory
