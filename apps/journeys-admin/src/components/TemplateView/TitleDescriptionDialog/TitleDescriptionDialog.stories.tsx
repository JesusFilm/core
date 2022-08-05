import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { defaultJourney } from '../data'
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

  return (
    <MockedProvider>
      <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
        <TitleDescriptionDialog open={open} onClose={() => setOpen(false)} />
      </JourneyProvider>
    </MockedProvider>
  )
}
export const Default = Template.bind({})

export default TitleDescriptionDialogStory as Meta
