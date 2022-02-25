import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../libs/storybook'
import { VideoLibrary } from '.'

const VideoLibraryStory = {
  ...simpleComponentConfig,
  component: VideoLibrary,
  title: 'Journeys-Admin/Editor/VideoLibrary'
}

const Template: Story = () => {
  const onSelect = (id: string): void => {
    console.log(id)
  }

  return <VideoLibrary onSelect={onSelect} />
}

export const Default = Template.bind({})

export default VideoLibraryStory as Meta
