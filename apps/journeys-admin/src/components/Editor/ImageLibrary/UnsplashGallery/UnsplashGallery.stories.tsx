import { Story, Meta } from '@storybook/react'
import { noop } from 'lodash'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { UnsplashGallery } from './UnsplashGallery'

const UnsplashGalleryStory = {
  ...simpleComponentConfig,
  component: UnsplashGallery,
  title: 'Journeys-Admin/Editor/ImageLibrary/UnsplashGallery'
}

const Template: Story = () => <UnsplashGallery onChange={noop} />

export const Default = Template.bind({})

export default UnsplashGalleryStory as Meta
