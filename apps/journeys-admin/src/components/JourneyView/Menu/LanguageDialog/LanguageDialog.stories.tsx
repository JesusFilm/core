import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journeysAdminConfig } from '../../../../libs/storybook'
import { defaultJourney } from '../../data'

import { GET_LANGUAGES, JOURNEY_LANGUAGE_UPDATE } from './LanguageDialog'

import { LanguageDialog } from '.'

const LanguageDialogStory = {
  ...journeysAdminConfig,
  component: LanguageDialog,
  title: 'Journeys-Admin/JourneyView/Menu/LanguageDialog'
}

const Template: Story = () => {
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
                      __typename: 'Translation'
                    },
                    {
                      value: 'French',
                      primary: false,
                      __typename: 'Translation'
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

export const Default = Template.bind({})
export const Error = Template.bind({})
Error.play = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Save' }))
}

export default LanguageDialogStory as Meta
