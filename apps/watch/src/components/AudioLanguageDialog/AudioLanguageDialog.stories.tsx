import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import { watchConfig } from '../../libs/storybook'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { getLanguagesSlugMock } from './testData'

import { AudioLanguageDialog } from '.'

const AudioLanguageDialogStory = {
  ...watchConfig,
  component: AudioLanguageDialog,
  title: 'Watch/AudioLanguageDialog',
  argTypes: {
    onClose: { action: 'close clicked' }
  }
}

const Template: Story<
  ComponentProps<typeof AudioLanguageDialog> & {
    mocks?: readonly MockedResponse[]
  }
> = ({ mocks, ...args }) => {
  return (
    <MockedProvider mocks={mocks}>
      <VideoProvider value={{ content: videos[0] }}>
        <AudioLanguageDialog {...args} />
      </VideoProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  open: true,
  mocks: [getLanguagesSlugMock]
}

export const Loading = Template.bind({})
Loading.args = {
  open: true,
  mocks: [{ ...getLanguagesSlugMock, delay: 100000000000000 }]
}

export default AudioLanguageDialogStory as Meta
