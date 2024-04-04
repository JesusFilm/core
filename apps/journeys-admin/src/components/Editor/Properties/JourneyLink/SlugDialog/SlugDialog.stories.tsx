import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { cache } from '../../../../../libs/apolloClient/cache'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { defaultJourney } from '../../../data'

import { JOURNEY_SLUG_UPDATE, SlugDialog } from './SlugDialog'

const SlugDialogStory: Meta<typeof SlugDialog> = {
  ...journeysAdminConfig,
  component: SlugDialog,
  title: 'Journeys-Admin/JourneyView/JourneyLink/SlugDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof SlugDialog> = {
  render: (args) => {
    return (
      <JourneyProvider
        value={{
          journey: defaultJourney,
          variant: 'admin'
        }}
      >
        <SlugDialog {...args} open />
      </JourneyProvider>
    )
  }
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      cache: cache(),
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
}

export const WithCustomDomain = {
  ...Template,
  args: {
    hostname: 'www.example.com'
  },
  parameters: {
    apolloClient: {
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
}

export const Error = {
  ...Template,
  parameters: {
    apolloClient: {
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
  },
  play: async () => {
    await userEvent.type(screen.getByRole('textbox'), ' error')
    const button = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(button)
  }
}

export default SlugDialogStory
