import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { VideoDetails } from '.'

const VideoDetailsStory = {
  ...journeysAdminConfig,
  component: VideoDetails,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoDetails'
}

const Template: Story = ({ ...args }) => (
  <VideoDetails
    videoId={args.videoId}
    open={args.open}
    handleOpen={args.handleOpen}
    onSelect={args.onSelect}
  />
)

export const Default = Template.bind({})
Default.args = {
  videoId: 'videoUUID',
  open: true,
  handleOpen: () => console.log('handleOpen'),
  onSelect: (id: string) => console.log('onSelect', id)
}

export default VideoDetailsStory as Meta
