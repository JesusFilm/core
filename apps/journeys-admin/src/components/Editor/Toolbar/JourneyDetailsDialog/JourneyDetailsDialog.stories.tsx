import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { ReactElement, useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { JOURNEY_SETTINGS_UPDATE } from '../../../../libs/useJourneyUpdateMutation/useJourneyUpdateMutation'

import { JourneyDetailsDialog } from './JourneyDetailsDialog'

const JourneyDetailsDialogStory: Meta<typeof JourneyDetailsDialog> = {
  ...simpleComponentConfig,
  component: JourneyDetailsDialog,
  title: 'Journeys-Admin/Editor/Toolbar/JourneyDetailsDialog',
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const JourneyDetailsDialogComponent = (args): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider mocks={args.mocks}>
      <JourneyProvider
        value={{
          journey: defaultJourney,
          variant: 'admin'
        }}
      >
        <JourneyDetailsDialog open={open} onClose={() => setOpen(false)} />
      </JourneyProvider>
    </MockedProvider>
  )
}

const Template: StoryObj<typeof JourneyDetailsDialog> = {
  render: (args) => <JourneyDetailsDialogComponent args={args} />
}

export const Default = {
  ...Template,
  args: {
    mocks: [
      {
        request: {
          query: JOURNEY_SETTINGS_UPDATE,
          variables: {
            id: defaultJourney.id,
            input: {
              title: 'Journey Heading'
            }
          }
        },
        result: {
          data: {
            journeyUpdate: {
              id: defaultJourney.id,
              __typename: 'Journey',
              title: 'Journey Heading'
            }
          }
        }
      }
    ]
  }
}

export const Error = {
  ...Template,
  args: {
    mocks: [
      {
        request: {
          query: JOURNEY_SETTINGS_UPDATE,
          variables: {
            id: defaultJourney.id,
            input: {
              title: 'Journey Heading error'
            }
          }
        },
        error: {
          name: 'USER_INPUT_ERROR',
          message: 'Field update failed. Reload the page or try again.'
        }
      }
    ]
  },
  play: async () => {
    await userEvent.type(screen.getByTestId('titletextbox'), ' error')
    const button = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(button)
  }
}

export default JourneyDetailsDialogStory
