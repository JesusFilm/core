import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, ComponentStory } from '@storybook/react'
import { watchConfig } from '../../../libs/storybook'
import { GET_VIDEOS } from '../Videos'
import { videos } from '../testData'
import { VideoContent } from './VideoContent'

const VideoContentStory = {
  ...watchConfig,
  component: VideoContent,
  title: 'Watch/Videos/VideoContent'
}

const getVideoMock: MockedResponse = {
  request: {
    query: GET_VIDEOS,
    variables: {
      where: {
        availableVariantLanguageIds: ['529']
      },
      page: 1,
      limit: 1
    }
  },
  result: {
    data: {
      videos: videos
    }
  }
}

const Template: ComponentStory<typeof VideoContent> = () => {
  return (
    <MockedProvider mocks={[getVideoMock]}>
      <VideoContent />
    </MockedProvider>
  )
}

export const Default = Template.bind({})

export default VideoContentStory as Meta
