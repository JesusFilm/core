import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { JourneyFields as Journey } from '../../../../__generated__/JourneyFields'
import { AddUserSection } from '.'

describe('AddUserSection', () => {
  it('opens email invite form on click', async () => {
    const { getByRole, queryByRole } = render(
      <JourneyProvider
        value={{ journey: { id: 'journeyId' } as unknown as Journey }}
      >
        <SnackbarProvider>
          <MockedProvider>
            <AddUserSection users={[]} />
          </MockedProvider>
        </SnackbarProvider>
      </JourneyProvider>
    )

    const button = getByRole('button', { name: 'Email' })
    expect(queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument()

    fireEvent.click(button)
    fireEvent.click(getByRole('menuitem', { name: 'Link' }))

    expect(queryByRole('menuitem', { name: 'Link' })).not.toBeInTheDocument()
    expect(queryByRole('menuitem', { name: 'Email' })).not.toBeInTheDocument()
    expect(queryByRole('button', { name: 'Copy' })).toBeInTheDocument()

    fireEvent.click(button)
    fireEvent.click(getByRole('menuitem', { name: 'Email' }))
    await waitFor(() =>
      expect(queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument()
    )
  })

  describe('copy to clipboard', () => {
    const originalNavigator = { ...global.navigator }

    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn()
        }
      })
    })

    afterEach(() => {
      jest.resetAllMocks()
      Object.assign(navigator, originalNavigator)
    })

    it('copies link to clipboard', async () => {
      const { getByRole, getByText } = render(
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <SnackbarProvider>
            <MockedProvider>
              <AddUserSection users={[]} />
            </MockedProvider>
          </SnackbarProvider>
        </JourneyProvider>
      )
      const button = getByRole('button', { name: 'Email' })
      fireEvent.click(button)
      fireEvent.click(getByRole('menuitem', { name: 'Link' }))
      const link = 'http://localhost/journeys/journeyId'
      expect(getByRole('textbox')).toHaveValue(link)
      fireEvent.click(getByRole('button', { name: 'Copy' }))
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(link)
      await waitFor(() =>
        expect(getByText('Editor invite link copied')).toBeInTheDocument()
      )
    })
  })
})
