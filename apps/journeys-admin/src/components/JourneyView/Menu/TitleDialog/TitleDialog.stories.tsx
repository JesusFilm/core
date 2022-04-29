import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { screen, userEvent } from '@storybook/testing-library'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { JourneyProvider } from '../../../../libs/context'
import { defaultJourney } from '../../data'
import { TitleDialog, JOURNEY_TITLE_UPDATE } from './TitleDialog'

const TitleDialogStory = {
  ...journeysAdminConfig,
  component: TitleDialog,
  title: 'Journeys-Admin/JourneyView/Menu/TitleDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = (args) => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider mocks={args.mocks}>
      <JourneyProvider value={defaultJourney}>
        <TitleDialog open={open} onClose={() => setOpen(false)} />
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
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

export const Error = Template.bind({})
Error.args = {
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
}
Error.play = () => {
  userEvent.type(screen.getByRole('textbox'), ' error')
  const button = screen.getByRole('button', { name: 'Save' })
  userEvent.click(button)
}

export default TitleDialogStory as Meta
