import { MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'

import '../../../../test/i18n'

import { GetLanguages } from '../../../../__generated__/GetLanguages'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GET_LANGUAGES } from '../../../libs/useLanguagesQuery'

import { HeaderAndLanguageFilter } from '.'

const HeaderAndLanguageFilterStory: Meta<typeof HeaderAndLanguageFilter> = {
  ...journeysAdminConfig,
  component: HeaderAndLanguageFilter,
  title: 'Journeys-Admin/TemplateGallery/HeaderAndLanguageFilter'
}

const getLanguagesMock: MockedResponse<GetLanguages> = {
  request: {
    query: GET_LANGUAGES,
    variables: {
      languageId: '529',
      where: {
        ids: [
          '529',
          '4415',
          '1106',
          '4451',
          '496',
          '20526',
          '584',
          '21028',
          '20615',
          '3934'
        ]
      }
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

const Template: StoryObj<ComponentProps<typeof HeaderAndLanguageFilter>> = {
  render: ({ ...args }) => <HeaderAndLanguageFilter {...args} />
}

export const Default = {
  ...Template,
  args: {
    selectedLanguageIds: [],
    onChange: noop
  },
  parameters: {
    apolloClient: {
      mocks: [getLanguagesMock]
    }
  }
}

export const WithAutocomplete = {
  ...Template,
  args: {
    selectedLanguageIds: [],
    onChange: noop
  },
  parameters: {
    apolloClient: {
      mocks: [getLanguagesMock]
    }
  },
  play: async () => {
    await userEvent.click(screen.getByRole('button'))
  }
}

export const Selected = {
  ...Template,
  args: {
    selectedLanguageIds: ['529'],
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
    selectedLanguageIds: ['529'],
    onChange: noop
  },
  parameters: {
    apolloClient: {
      mocks: [{ ...getLanguagesMock, delay: 100000000000000 }]
    }
  }
}

export default HeaderAndLanguageFilterStory
