import { ComponentMeta, ComponentStory } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { watchConfig } from '../../libs/storybook'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/testData'
import { GET_VIDEO_CHILDREN } from './VideoContainerPage'
import { VideoContainerPage } from '.'

const VideoContainerPageStory: ComponentMeta<typeof VideoContainerPage> = {
  ...watchConfig,
  component: VideoContainerPage,
  title: 'Watch/VideoContainerPage',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: ComponentStory<typeof VideoContainerPage> = () => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: GET_VIDEO_CHILDREN,
          variables: {
            id: videos[0].id
          }
        },
        result: {
          data: {
            video: {
              children: [...videos[0].children]
            }
          }
        }
      }
    ]}
  >
    <VideoProvider value={{ content: videos[0] }}>
      <VideoContainerPage />
    </VideoProvider>
  </MockedProvider>
)

export const Default = Template.bind({})

export default VideoContainerPageStory
