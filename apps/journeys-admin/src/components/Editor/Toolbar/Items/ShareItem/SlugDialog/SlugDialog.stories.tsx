import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ReactElement, useState } from 'react'
import { screen, userEvent } from 'storybook/test'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { JOURNEY_SLUG_UPDATE, SlugDialog } from './SlugDialog'

const SlugDialogStory: Meta<typeof SlugDialog> = {
  ...journeysAdminConfig,
  component: SlugDialog,
  title: 'Journeys-Admin/Editor/Toolbar/Items/ShareItem/SlugDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const SlugDialogComponent = (args): ReactElement => {
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

const Template: StoryObj<typeof SlugDialog> = {
  render: (args) => <SlugDialogComponent args={args} />
}

export const Default = {
  ...Template,
  args: {
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
}

export const Error = {
  ...Template,
  args: {
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
  },
  play: async () => {
    await userEvent.type(screen.getByRole('textbox'), ' error')
    const button = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(button)
  }
}

export default SlugDialogStory
