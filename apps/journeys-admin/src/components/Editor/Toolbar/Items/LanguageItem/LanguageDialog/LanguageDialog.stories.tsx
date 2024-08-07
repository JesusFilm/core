import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { ReactElement, useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { JOURNEY_LANGUAGE_UPDATE } from './LanguageDialog'

import { LanguageDialog } from '.'

const LanguageDialogStory: Meta<typeof LanguageDialog> = {
  ...journeysAdminConfig,
  component: LanguageDialog,
  title: 'Journeys-Admin/Editor/Toolbar/Items/LanguageItem/LanguageDialog'
}

const LanguageDialogComponent = (): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
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
                  __typename: 'Language',
                  id: '529',
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
        },
        {
          request: {
            query: JOURNEY_LANGUAGE_UPDATE,
            variables: {
              id: defaultJourney.id,
              input: {
                languageId: '496'
              }
            }
          },
          result: {
            data: {
              journeyUpdate: {
                id: defaultJourney.id,
                __typename: 'Journey',
                language: {
                  id: '496',
                  __typename: 'Language',
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
                }
              }
            }
          }
        }
      ]}
    >
      <JourneyProvider
        value={{
          journey: defaultJourney,
          variant: 'admin'
        }}
      >
        <LanguageDialog open={open} onClose={() => setOpen(false)} />
      </JourneyProvider>
    </MockedProvider>
  )
}

const Template: StoryObj<typeof LanguageDialog> = {
  render: () => <LanguageDialogComponent />
}

export const Default = { ...Template }

export const Error = {
  ...Template,
  play: async () => {
    const button = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(button)
  }
}

export default LanguageDialogStory
