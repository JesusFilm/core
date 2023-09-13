import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { ReactElement, useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journeysAdminConfig } from '../../../../../libs/storybook'
import { defaultJourney } from '../../../../JourneyView/data'

import { JOURNEY_TITLE_UPDATE, TitleDialog } from './TitleDialog'

const TitleDialogStory: Meta<typeof TitleDialog> = {
  ...journeysAdminConfig,
  component: TitleDialog,
  title: 'Journeys-Admin/JourneyView/Menu/TitleDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const TitleDialogComponent = (args): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider mocks={args.mocks}>
      <JourneyProvider
        value={{
          journey: defaultJourney,
          variant: 'admin'
        }}
      >
        <TitleDialog open={open} onClose={() => setOpen(false)} />
      </JourneyProvider>
    </MockedProvider>
  )
}

const Template: StoryObj<typeof TitleDialog> = {
  render: (args) => <TitleDialogComponent args={args} />
}

export const Default = {
  ...Template,
  args: {
    mocks: [
      {
        request: {
          query: JOURNEY_TITLE_UPDATE,
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
          query: JOURNEY_TITLE_UPDATE,
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
    await userEvent.type(screen.getByRole('textbox'), ' error')
    const button = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(button)
  }
}

export default TitleDialogStory
