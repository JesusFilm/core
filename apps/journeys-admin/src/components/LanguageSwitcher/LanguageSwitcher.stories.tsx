import { MockedProvider } from '@apollo/client/testing'
import { jest } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../libs/storybook'
import { GET_LANGUAGES } from '../../libs/useLanguagesQuery'

import { LanguageSwitcher } from './LanguageSwitcher'

const LanguageSwitcherStory: Meta<typeof LanguageSwitcher> = {
  ...simpleComponentConfig,
  component: LanguageSwitcher,
  title: 'Journeys-Admin/LanguageSwitcher'
}

export const Default: StoryObj<typeof LanguageSwitcher> = {
  render: () => (
    <MockedProvider
      mocks={[
        {
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
                  id: '22658',
                  bcp47: 'ar',
                  name: [
                    {
                      primary: true,
                      value: ' اللغة العربية'
                    },
                    {
                      primary: false,
                      value: 'Arabic, Modern Standard'
                    }
                  ]
                },
                {
                  id: '529',
                  bcp47: 'en',
                  name: [
                    {
                      primary: true,
                      value: 'English'
                    }
                  ]
                },
                {
                  id: '496',
                  bcp47: 'fr',
                  name: [
                    {
                      primary: true,
                      value: 'Français'
                    },
                    {
                      primary: false,
                      value: 'French'
                    }
                  ]
                }
              ]
            }
          }
        }
      ]}
    >
      <LanguageSwitcher open handleClose={jest.fn()} />
    </MockedProvider>
  )
}
export default LanguageSwitcherStory
