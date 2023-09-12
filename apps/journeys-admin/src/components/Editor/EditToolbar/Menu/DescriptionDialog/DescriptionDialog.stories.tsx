import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { ReactElement, useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journeysAdminConfig } from '../../../../../libs/storybook'
import { defaultJourney } from '../../../../JourneyView/data'

import { DescriptionDialog, JOURNEY_DESC_UPDATE } from './DescriptionDialog'

const DescriptionDialogStory: Meta<typeof DescriptionDialog> = {
  ...journeysAdminConfig,
  component: DescriptionDialog,
  title: 'Journeys-Admin/JourneyView/Menu/DescriptionDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const DescriptionDialogComponent = (args): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider mocks={args.mocks}>
      <JourneyProvider
        value={{
          journey: defaultJourney,
          variant: 'admin'
        }}
      >
        <DescriptionDialog open={open} onClose={() => setOpen(false)} />
      </JourneyProvider>
    </MockedProvider>
  )
}

const Template: StoryObj<typeof DescriptionDialog> = {
  render: (args) => <DescriptionDialogComponent args={args} />
}

export const Default = {
  ...Template,
  args: {
    mocks: [
      {
        request: {
          query: JOURNEY_DESC_UPDATE,
          variables: {
            id: defaultJourney.id,
            input: {
              description: 'Description'
            }
          }
        },
        result: {
          data: {
            journeyUpdate: {
              id: defaultJourney.id,
              __typename: 'Journey',
              description: 'Description'
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
          query: JOURNEY_DESC_UPDATE,
          variables: {
            id: defaultJourney.id,
            input: {
              description: 'Description error'
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

export default DescriptionDialogStory
