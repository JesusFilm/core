import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { defaultJourney } from '../../../../JourneyView/data'
import { TeamProvider } from '../../../../Team/TeamProvider'

import { GET_LANGUAGES } from './LanguageDialog'
import { JOURNEY_LANGUAGE_UPDATE } from './LanguageDialog/LanguageDialog'
import { LanguageMenuItem } from './LanguageMenuItem'

describe('LanguageMenuItem', () => {
  it('should handle edit journey language', async () => {
    const onClose = jest.fn()
    const { getByRole } = render(
      <SnackbarProvider>
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
                    languageId: '529'
                  }
                }
              },
              result: {
                data: {
                  journeyUpdate: {
                    id: defaultJourney.id,
                    __typename: 'Journey',
                    language: {
                      id: '529',
                      __typename: 'Language',
                      name: [
                        {
                          value: 'English',
                          primary: true,
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
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <LanguageMenuItem onClose={onClose} />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Language' }))
    await waitFor(() => expect(getByRole('dialog')).toBeInTheDocument())
    expect(getByRole('combobox')).toHaveValue('English')
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })
})
