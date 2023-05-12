import { Story, Meta } from '@storybook/react'
import { SWRConfig } from 'swr'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import {
  getVideosLoading,
  getVideoWithLongDescription,
  getVideosWithOffsetAndUrl
} from '../VideoFromYouTube.handlers'
import { YouTubeDetails } from '.'

const YouTubeDetailsStory = {
  ...journeysAdminConfig,
  component: YouTubeDetails,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoFromYouTube/YouTubeDetails',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: Story = ({ id, onSelect }) => {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <YouTubeDetails id={id} open onSelect={onSelect} />
    </SWRConfig>
  )
}

export const Default = Template.bind({})
Default.args = {
  id: 'jQaeIJOA6J0'
}
Default.parameters = {
  msw: {
    handlers: [getVideosWithOffsetAndUrl]
  }
}

export const LongDescription = Template.bind({})
LongDescription.args = {
  id: 'jQaeIJOA6J0'
}
LongDescription.parameters = {
  msw: {
    handlers: [getVideoWithLongDescription]
  }
}

export const Loading: Story = Template.bind({})
Loading.args = {
  id: 'jQaeIJOA6J0'
}
Loading.parameters = {
  msw: {
    handlers: [getVideosLoading]
  }
}

export default YouTubeDetailsStory as Meta
