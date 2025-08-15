import { MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryFn, StoryObj } from '@storybook/nextjs'
import { ReactElement } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  GetLanguages,
  GetLanguagesVariables
} from '../../../../../__generated__/GetLanguages'

import { JourneyDetails } from './JourneyDetails'

const JourneyDetailsStory: Meta<typeof JourneyDetails> = {
  ...journeysAdminConfig,
  component: JourneyDetails,
  title: 'Journeys-Admin/Editor/Toolbar/JourneyDetails',
  parameters: {
    ...journeysAdminConfig.parameters,
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
          slug: 'english',
          id: '529',
          name: [
            {
              value: 'English',
              primary: true,
              __typename: 'LanguageName'
            }
          ]
        }
      ]
    }
  }
}

const JourneyDetailsComponent = (): ReactElement => {
  return (
    <JourneyProvider
      value={{
        journey: {
          ...defaultJourney,
          title:
            'Some extra long title where it will cause ellipsis to appear I hope this is long enough',
          description:
            'Some extra long description where it will cause ellipsis to appear I hope this is long enough'
        },
        variant: 'admin'
      }}
    >
      <Box
        sx={{
          maxWidth: { xs: 220, sm: '100%' },
          display: 'block',
          textAlign: 'left',
          overflow: 'hidden',
          whiteSpace: { xs: 'unset', sm: 'nowrap' },
          textOverflow: 'ellipsis',
          borderRadius: '8px',
          flexShrink: 1,
          px: 0
        }}
      >
        <JourneyDetails />
      </Box>
    </JourneyProvider>
  )
}

const Template: StoryObj<typeof JourneyDetails> = {
  render: () => <JourneyDetailsComponent />
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [getLanguagesMock]
    }
  }
}

export const Ellipsis = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [getLanguagesMock]
    }
  },
  decorators: [
    (Story: StoryFn<typeof JourneyDetails>) => (
      <Box width={400}>
        <Story />
      </Box>
    )
  ]
}

export default JourneyDetailsStory
