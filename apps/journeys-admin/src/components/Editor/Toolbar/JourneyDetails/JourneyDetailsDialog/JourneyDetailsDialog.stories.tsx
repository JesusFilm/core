import { MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'
import { ReactElement, useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import {
  GetLanguages,
  GetLanguagesVariables
} from '../../../../../../__generated__/GetLanguages'
import { JOURNEY_SETTINGS_UPDATE } from '../../../../../libs/useJourneyUpdateMutation/useJourneyUpdateMutation'

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

const getLanguagesMock: MockedResponse<GetLanguages, GetLanguagesVariables> = {
  request: {
    query: GET_LANGUAGES,
    variables: {
      languageId: '529'
    }
  },
  result: {
    data: {
      languages: [
        {
          __typename: 'Language',
          id: '529',
          slug: 'english',
          name: [
            {
              value: 'English',
              primary: true,
              __typename: 'LanguageName'
            }
          ]
        },
        {
          id: '496',
          __typename: 'Language',
          slug: 'french',
          name: [
            {
              value: 'Français',
              primary: true,
              __typename: 'LanguageName'
            },
            {
              value: 'French',
              primary: false,
              __typename: 'LanguageName'
            }
          ]
        },
        {
          id: '1106',
          __typename: 'Language',
          slug: 'german-standard',
          name: [
            {
              value: 'Deutsch',
              primary: true,
              __typename: 'LanguageName'
            },
            {
              value: 'German, Standard',
              primary: false,
              __typename: 'LanguageName'
            }
          ]
        }
      ]
    }
  }
}

const JourneyDetailsDialogComponent = (args): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <JourneyProvider
      value={{
        journey: defaultJourney,
        variant: 'admin'
      }}
    >
      <JourneyDetailsDialog open={open} onClose={() => setOpen(false)} />
    </JourneyProvider>
  )
}

const Template: StoryObj<typeof JourneyDetailsDialog> = {
  render: () => <JourneyDetailsDialogComponent />
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [getLanguagesMock]
    }
  }
}

export const Error = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [
        getLanguagesMock,
        {
          request: {
            query: JOURNEY_SETTINGS_UPDATE,
            variables: {
              id: defaultJourney.id,
              input: {
                title: 'Journey Heading error',
                description: 'Description',
                languageId: '529'
              }
            }
          },
          error: {
            name: 'USER_INPUT_ERROR',
            message:
              'Journey details update failed. Reload the page or try again.'
          }
        }
      ]
    }
  },
  play: async () => {
    await userEvent.type(screen.getAllByRole('textbox')[0], ' error')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  }
}

export default JourneyDetailsDialogStory
