import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ReactElement, useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journeysAdminConfig } from '../../../../libs/storybook'
import { publishedJourney } from '../../data'

import { EmbedJourneyDialog } from './EmbedJourneyDialog'

const EmbedJourneyDialogStory: Meta<typeof EmbedJourneyDialog> = {
  ...journeysAdminConfig,
  component: EmbedJourneyDialog,
  title: 'Journeys-Admin/JourneyView/JourneyLink/EmbedJourneyDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const EmbedJourneyDialogComponent = ({ ...args }): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider>
      <JourneyProvider
        value={{
          journey: args.journey,
          variant: 'admin'
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

const Template: StoryObj<typeof EmbedJourneyDialog> = {
  render: ({ ...args }) => <EmbedJourneyDialogComponent {...args} />
}

export const Default = {
  ...Template,
  args: {
    journey: publishedJourney
  }
}

export default EmbedJourneyDialogStory
