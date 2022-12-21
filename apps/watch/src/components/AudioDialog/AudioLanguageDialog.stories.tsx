import { useState } from 'react'
import { Meta, Story } from '@storybook/react'
import { watchConfig } from '../../libs/storybook'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/testData'
import { AudioLanguageDialog } from '.'

const AudioLanguageDialogStory = {
  ...watchConfig,
  component: AudioLanguageDialog,
  title: 'Watch/AudioLanguageDialog'
}

const Template: Story = () => {
  const [open, setOpen] = useState(true)
  return (
    <VideoProvider value={{ content: videos[0] }}>
      <AudioLanguageDialog open={open} onClose={() => setOpen(false)} />
    </VideoProvider>
  )
}

export const Default = Template.bind({})

export default AudioLanguageDialogStory as Meta
