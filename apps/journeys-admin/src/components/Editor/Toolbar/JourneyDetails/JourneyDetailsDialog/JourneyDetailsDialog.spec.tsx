import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { getLanguagesMock } from '@core/journeys/ui/useLanguagesQuery/useLanguagesQuery.mock'

import { getJourneySettingsUpdateMock } from '../../../../../libs/useJourneyUpdateMutation/useJourneyUpdateMutation.mock'
import { journey } from '../../../../JourneyList/ActiveJourneyList/ActivePriorityList/ActiveJourneyListData'

import { JourneyDetailsDialog } from '.'

const onClose = jest.fn()

jest.mock('@mui/material/useMediaQuery')

describe('JourneyDetailsDialog', () => {
  it('should not set journey title on close', async () => {
    const mock = getJourneySettingsUpdateMock({
      title: 'New Journey',
      description: 'Description',
      languageId: '529'
    })
    render(
      <MockedProvider mocks={[{ ...mock }]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <JourneyDetailsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await userEvent.type(screen.getAllByRole('textbox')[0], 'New Journey')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(journey.title).not.toBe('New Journey')
  })

  it('should update journey title, description and language on submit', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          ...defaultJourney,
          id: defaultJourney.id,
          __typename: 'Journey',
          title: 'Changed Title',
          description: 'Changed Description',
          language: {
            __typename: 'Language',
            id: '496',
            bcp47: null,
            iso3: null,
            name: [
              {
                __typename: 'LanguageName',
                value: 'Français',
                primary: true
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
    }))

    const mock = getJourneySettingsUpdateMock({
      title: 'Changed Title',
      description: 'Changed Description',
      languageId: '496'
    })
    render(
      <MockedProvider mocks={[{ ...mock, result }, getLanguagesMock]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <JourneyDetailsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'Changed Title' }
    })

    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'Changed Description' }
    })

    fireEvent.focus(screen.getByRole('combobox'))
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' })
    await waitFor(() => screen.getByRole('option', { name: 'French Français' }))
    fireEvent.click(screen.getByRole('option', { name: 'French Français' }))

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })

  it('shows notistack error alert when title fails to update', async () => {
    const mock = getJourneySettingsUpdateMock({
      title: 'Changed Title',
      description: 'Changed Description',
      languageId: '496'
    })
    render(
      <MockedProvider mocks={[{ ...mock }]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <JourneyDetailsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'New Journey' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(
        screen.getByText(
          'Journey details update failed. Reload the page or try again.'
        )
      ).toBeInTheDocument()
    )
  })

  it('should require the title field', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: defaultJourney.id,
          __typename: 'Journey'
        }
      }
    }))
    const mock = getJourneySettingsUpdateMock({
      title: 'Changed Title',
      description: 'Changed Description',
      languageId: '496'
    })
    render(
      <MockedProvider mocks={[{ ...mock }]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <JourneyDetailsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: '' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(screen.getByText('Required')).toBeInTheDocument()
    )
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })
})
