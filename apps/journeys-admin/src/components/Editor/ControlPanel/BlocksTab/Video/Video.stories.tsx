import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { Video } from '.'

const VideoStory = {
  ...journeysAdminConfig,
  component: Video,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/Video'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <Video />
    </MockedProvider>
  )
}

export default VideoStory as Meta
