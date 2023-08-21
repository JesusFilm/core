import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journeysAdminConfig } from '../../../../libs/storybook'
import { defaultJourney } from '../../data'

import { JOURNEY_SLUG_UPDATE, SlugDialog } from './SlugDialog'

const SlugDialogStory = {
  ...journeysAdminConfig,
  component: SlugDialog,
  title: 'Journeys-Admin/JourneyView/JourneyLink/SlugDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = (args) => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider mocks={args.mocks}>
      <JourneyProvider
        value={{
          journey: defaultJourney,
          variant: 'admin'
        }}
      >
        <SlugDialog open={open} onClose={() => setOpen(false)} />
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  mocks: [
    {
      request: {
        query: JOURNEY_SLUG_UPDATE,
        variables: {
          id: defaultJourney.id,
          input: {
            slug: 'default'
          }
        }
      },
      result: {
        data: {
          journeyUpdate: {
            id: defaultJourney.id,
            __typename: 'Journey',
            slug: 'default'
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
        query: JOURNEY_SLUG_UPDATE,
        variables: {
          id: defaultJourney.id,
          input: {
            slug: 'default error'
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
Error.play = async () => {
  await userEvent.type(screen.getByRole('textbox'), ' error')
  const button = screen.getByRole('button', { name: 'Save' })
  await userEvent.click(button)
}

export default SlugDialogStory as Meta
