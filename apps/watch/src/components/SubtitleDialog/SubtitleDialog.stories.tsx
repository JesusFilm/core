import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { watchConfig } from '../../libs/storybook'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { SubtitleDialog } from './SubtitleDialog'
import { getSubtitleMock } from './testData'

const SubtitleDialogStory: Meta<typeof SubtitleDialog> = {
  ...watchConfig,
  component: SubtitleDialog,
  title: 'Watch/SubtitleDialog',
  argTypes: {
    onClose: { action: 'close clicked' }
  }
}

type Story = StoryObj<
  ComponentProps<typeof SubtitleDialog> & {
    mocks?: readonly MockedResponse[]
  }
>

const Template: Story = {
  render: ({ mocks, ...args }) => {
    return (
      <MockedProvider mocks={mocks}>
        <VideoProvider value={{ content: videos[0] }}>
          <SubtitleDialog {...args} />
        </VideoProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    open: true,
    mocks: [getSubtitleMock]
  }
}

export const Loading = {
  ...Template,
  args: {
    open: true,
    mocks: [{ ...getSubtitleMock, delay: 100000000000000 }]
  }
}

export default SubtitleDialogStory
