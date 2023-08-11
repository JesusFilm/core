import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import { watchConfig } from '../../libs/storybook'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { SubtitleDialog } from './SubtitleDialog'
import { getSubtitleMock } from './testData'

const SubtitleDialogStory = {
  ...watchConfig,
  component: SubtitleDialog,
  title: 'Watch/SubtitleDialog',
  argTypes: {
    onClose: { action: 'close clicked' }
  }
}
const Template: Story<
  ComponentProps<typeof SubtitleDialog> & {
    mocks?: readonly MockedResponse[]
  }
> = ({ mocks, ...args }) => {
  return (
    <MockedProvider mocks={mocks}>
      <VideoProvider value={{ content: videos[0] }}>
        <SubtitleDialog {...args} />
      </VideoProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  open: true,
  mocks: [getSubtitleMock]
}

export const Loading = Template.bind({})
Loading.args = {
  open: true,
  mocks: [{ ...getSubtitleMock, delay: 100000000000000 }]
}

export default SubtitleDialogStory as Meta
