import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../libs/storybook'
import { UnsplashGallery } from './UnsplashGallery'

const UnsplashGalleryStory = {
  ...simpleComponentConfig,
  component: UnsplashGallery,
  title: 'Journeys-Admin/UnsplashGallery'
}

const Template: Story = () => <UnsplashGallery />

export const Default = Template.bind({})

export default UnsplashGalleryStory as Meta
