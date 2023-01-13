import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { noop } from 'lodash'
import { MockedProvider } from '@apollo/client/testing'
import { VideoProvider } from '../../libs/videoContext'
import { watchConfig } from '../../libs/storybook'
import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { videos } from '../Videos/testData'
import { SubtitleDialog } from './SubtitleDialog'
import { getSubtitleMock } from './testData'

const SubtitleDialogStory = {
  ...watchConfig,
  component: SubtitleDialog,
  title: 'Watch/SubtitleDialog',
  parameters: {
    theme: 'light'
  }
}

const Template: Story<
  ComponentProps<typeof SubtitleDialog> & { video: VideoContentFields }
> = ({ ...args }) => {
  return (
    <MockedProvider mocks={[getSubtitleMock]}>
      <VideoProvider value={{ content: videos[0] }}>
        <SubtitleDialog {...args} />
      </VideoProvider>
    </MockedProvider>
  )
}

export const Basic = Template.bind({})
Basic.args = {
  open: true,
  onClose: noop
}

export default SubtitleDialogStory as Meta
