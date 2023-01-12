import { useState } from 'react'
import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { watchConfig } from '../../libs/storybook'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/testData'
import { getLanguagesSlugMock } from './testData'
import { AudioLanguageDialog } from '.'

const AudioLanguageDialogStory = {
  ...watchConfig,
  component: AudioLanguageDialog,
  title: 'Watch/AudioLanguageDialog'
}

const Template: Story = () => {
  const [open, setOpen] = useState(true)
  return (
    <MockedProvider mocks={[getLanguagesSlugMock]}>
      <VideoProvider value={{ content: videos[0] }}>
        <AudioLanguageDialog open={open} onClose={() => setOpen(false)} />
      </VideoProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})

export default AudioLanguageDialogStory as Meta
