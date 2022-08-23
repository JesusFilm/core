import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { publishedJourney } from '../../../data'
import { EmbedJourneyDialog } from './EmbedJourneyDialog'

const EmbedJourneyDialogStory = {
  ...journeysAdminConfig,
  component: EmbedJourneyDialog,
  title: 'Journeys-Admin/JourneyView/Properties/EmbedJourneyDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider>
      <JourneyProvider
        value={{
          journey: args.journey,
          admin: true
        }}
      >
        <EmbedJourneyDialog
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        />
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  journey: publishedJourney
}

export default EmbedJourneyDialogStory as Meta
