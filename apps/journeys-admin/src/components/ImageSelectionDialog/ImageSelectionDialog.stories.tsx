import { useState } from 'react'
import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../libs/storybook'
import { ImageSelectionDialog } from '.'

const ImageSelectionDialogStory = {
  ...simpleComponentConfig,
  component: ImageSelectionDialog,
  title: 'Journeys-Admin/ImageSelectionDialog'
}

const Template: Story = () => {
  const [open, setOpen] = useState(true)

  return <ImageSelectionDialog open={open} onClose={() => setOpen(false)} />
}

export const Default = Template.bind({})

export default ImageSelectionDialogStory as Meta
