import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { JourneyProvider } from '@core/journeys/ui'
import { defaultJourney } from '../../data'
import { JOURNEY_LANGUAGE_UPDATE, GET_LANGUAGES } from './LanguageDialog'
import { LanguageDialog } from '.'

const onClose = jest.fn()

describe('JourneyView/Menu/LanguageDialog', () => {
  const getLanguagesMock = {
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

  it('should not set journey language on close', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
            <LanguageDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(getByRole('textbox')).toHaveValue('English'))
    fireEvent.focus(getByRole('textbox'))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    await waitFor(() => getByRole('option', { name: 'French Français' }))
    fireEvent.click(getByRole('option', { name: 'French Français' }))
    expect(getByRole('textbox')).toHaveValue('French')
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
    await waitFor(() => expect(getByRole('textbox')).toHaveValue('English'))
  })

  it('should update journey language on submit', async () => {
    const result = jest.fn(() => ({
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
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          getLanguagesMock,
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
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
            <LanguageDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.focus(getByRole('textbox'))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    await waitFor(() => getByRole('option', { name: 'French Français' }))
    fireEvent.click(getByRole('option', { name: 'French Français' }))
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('shows notistack error alert when language fails to update', async () => {
    // relies on no JOURNEY_LANGUAGE_UPDATE mock
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
            <LanguageDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.focus(getByRole('textbox'))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    await waitFor(() => getByRole('option', { name: 'French Français' }))
    fireEvent.click(getByRole('option', { name: 'French Français' }))
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(
        getByText('There was an error updating language')
      ).toBeInTheDocument()
    )
  })
})
