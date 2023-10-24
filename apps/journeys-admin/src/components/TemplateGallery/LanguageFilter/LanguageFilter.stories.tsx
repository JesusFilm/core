import { MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'

import { GetLanguages } from '../../../../__generated__/GetLanguages'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GET_LANGUAGES } from '../../Editor/EditToolbar/Menu/LanguageMenuItem/LanguageDialog'

import { LanguageFilter } from '.'

const LanguageFilterStory: Meta<typeof LanguageFilter> = {
  ...journeysAdminConfig,
  component: LanguageFilter,
  title: 'Journeys-Admin/TemplateGallery/LanguageFilter'
}

const getLanguagesMock: MockedResponse<GetLanguages> = {
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
          name: [
            {
              value: 'English',
              primary: true,
              __typename: 'Translation'
            }
          ]
        },
        {
          id: '496',
          __typename: 'Language',
          name: [
            {
              value: 'Français',
              primary: true,
              __typename: 'Translation'
            },
            {
              value: 'French',
              primary: false,
              __typename: 'Translation'
            }
          ]
        },
        {
          id: '1106',
          __typename: 'Language',
          name: [
            {
              value: 'Deutsch',
              primary: true,
              __typename: 'Translation'
            },
            {
              value: 'German, Standard',
              primary: false,
              __typename: 'Translation'
            }
          ]
        }
      ]
    }
  }
}

const Template: StoryObj<ComponentProps<typeof LanguageFilter>> = {
  render: ({ ...args }) => <LanguageFilter {...args} />
}

export const Default = {
  ...Template,
  args: {
    languageId: '529',
    onChange: noop
  },
  parameters: {
    apolloClient: {
      mocks: [getLanguagesMock]
    }
  }
}

export const Loading = {
  ...Template,
  args: {
    languageId: '529',
    onChange: noop
  },
  parameters: {
    apolloClient: {
      mocks: [{ ...getLanguagesMock, delay: 100000000000000 }]
    }
  }
}

export default LanguageFilterStory
