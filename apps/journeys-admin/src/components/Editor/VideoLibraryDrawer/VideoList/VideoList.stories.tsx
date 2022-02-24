import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { VideoList } from '.'

const VideoListStory = {
    ...simpleComponentConfig,
    component: VideoList,
    title: 'Journeys-Admin/Editor/VideoLibrary/VideoList'
}

const Template: Story = () => <VideoList />
export const Default = Template.bind({})

export default VideoListStory as Meta
