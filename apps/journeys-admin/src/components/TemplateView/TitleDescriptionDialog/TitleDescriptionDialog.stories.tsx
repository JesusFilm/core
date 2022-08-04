import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { TitleDescriptionDialog } from './TitleDescriptionDialog'

const TitleDescriptionDialogStory = {
  ...journeysAdminConfig,
  component: TitleDescriptionDialog,
  title: 'Journeys-Admin/TemplateView/TitleDescriptionDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = () => {
  const [open, setOpen] = useState(true)

  return <TitleDescriptionDialog open={open} onClose={() => setOpen(false)} />
}
export const Default = Template.bind({})

export default TitleDescriptionDialogStory as Meta
