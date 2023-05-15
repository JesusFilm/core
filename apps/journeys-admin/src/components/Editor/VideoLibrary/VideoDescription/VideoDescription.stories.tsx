import { ComponentProps } from 'react'
import { Meta, Story } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { VideoDescription } from './VideoDescription'

const VideoDescriptionStory = {
  ...journeysAdminConfig,
  component: VideoDescription,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoDescription',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: Story<ComponentProps<typeof VideoDescription>> = ({
  displayMore,
  setDisplayMore
}) => {
  return (
    <VideoDescription
      displayMore={displayMore}
      setDisplayMore={setDisplayMore}
    />
  )
}

const Default = Template.bind({})
Default.args = {
  displayMore: false
}

const Less = Template.bind({})
Less.args = {
  displayMore: true
}

export default VideoDescriptionStory as Meta
