import { useState } from 'react'
import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../libs/storybook'
import { ImageLibrary } from '.'

const ImageLibraryStory = {
  ...simpleComponentConfig,
  component: ImageLibrary,
  title: 'Journeys-Admin/Editor/ImageLibrary'
}

const Template: Story = () => {
  const [open, setOpen] = useState(true)

  return <ImageLibrary open={open} onClose={() => setOpen(false)} />
}

export const Default = Template.bind({})

export default ImageLibraryStory as Meta
