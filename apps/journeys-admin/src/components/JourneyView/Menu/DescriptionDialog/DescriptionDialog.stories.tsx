import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { screen, userEvent } from '@storybook/testing-library'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { defaultJourney } from '../../data'
import { JourneyProvider } from '../../../../libs/context'
import { DescriptionDialog, JOURNEY_DESC_UPDATE } from './DescriptionDialog'

const DescriptionDialogStory = {
  ...journeysAdminConfig,
  component: DescriptionDialog,
  title: 'Journeys-Admin/JourneyView/Menu/DescriptionDialog'
}

const Template: Story = (args) => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider mocks={args.mocks}>
      <JourneyProvider value={defaultJourney}>
        <DescriptionDialog open={open} onClose={() => setOpen(false)} />
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
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

export const Error = Template.bind({})
Error.args = {
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
        message: 'Mocked network error'
      }
    }
  ]
}
Error.play = () => {
  userEvent.type(screen.getByRole('textbox'), ' error')
  const button = screen.getByRole('button', { name: 'Save' })
  userEvent.click(button)
}

export default DescriptionDialogStory as Meta
