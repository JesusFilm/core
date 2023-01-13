import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { watchConfig } from '../../libs/storybook'
import { VideoProvider } from '../../libs/videoContext'
import { getLanguagesSlugMock } from '../AudioLanguageDialog/testData'
import { videos } from '../Videos/__generated__/testData'
import { VideoContentPage } from '.'

const VideoContentPageStory = {
  ...watchConfig,
  component: VideoContentPage,
  title: 'Watch/VideoContentPage',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ComponentProps<typeof VideoContentPage>> = ({
  ...args
}) => (
  <MockedProvider mocks={[getLanguagesSlugMock]}>
    <VideoProvider value={{ content: videos[0] }}>
      <VideoContentPage {...args} />
    </VideoProvider>
  </MockedProvider>
)

export const Default = Template.bind({})

export default VideoContentPageStory as Meta
