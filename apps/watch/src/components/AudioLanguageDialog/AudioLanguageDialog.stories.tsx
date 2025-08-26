import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { watchConfig } from '../../libs/storybook'
import { getLanguagesSlugMock } from '../../libs/useLanguagesSlugQuery/useLanguagesSlugQuery.mock'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { AudioLanguageDialog } from '.'

const AudioLanguageDialogStory: Meta<typeof AudioLanguageDialog> = {
  ...watchConfig,
  component: AudioLanguageDialog,
  title: 'Watch/AudioLanguageDialog',
  argTypes: {
    onClose: { action: 'close clicked' }
  }
}

type Story = StoryObj<
  ComponentProps<typeof AudioLanguageDialog> & {
    mocks?: readonly MockedResponse[]
  }
>

const Template: Story = {
  render: ({ mocks, ...args }) => {
    return (
      <MockedProvider mocks={mocks}>
        <VideoProvider value={{ content: videos[0] }}>
          <AudioLanguageDialog {...args} />
        </VideoProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    open: true,
    mocks: [getLanguagesSlugMock]
  }
}

export const Loading = {
  ...Template,
  args: {
    open: true,
    mocks: [{ ...getLanguagesSlugMock, delay: 100000000000000 }]
  }
}

export default AudioLanguageDialogStory
