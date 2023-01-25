import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../libs/storybook'
import { UnsplashLibrary } from './UnsplashLibrary'

const UnsplashLibraryStory = {
  ...simpleComponentConfig,
  component: UnsplashLibrary,
  title: 'Journeys-Admin/UnsplashLibrary'
}

const Template: Story = () => <UnsplashLibrary />

export const Default = Template.bind({})

export default UnsplashLibraryStory as Meta
