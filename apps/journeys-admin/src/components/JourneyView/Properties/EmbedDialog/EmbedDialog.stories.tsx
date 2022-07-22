import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { EmbedDialog } from './EmbedDialog'

const EmbedDialogStory = {
  ...journeysAdminConfig,
  component: EmbedDialog,
  title: 'Journeys-Admin/JourneyView/Properties/EmbedDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = (args) => {
  const [open, setOpen] = useState(true)

  return <EmbedDialog open={open} onClose={() => setOpen(false)} />
}

export const Default = Template.bind({})

export default EmbedDialogStory as Meta
