import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { TeamProvider } from '@core/journeys/ui/TeamProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'

import { TranslateJourneyMenuItem } from '.'

describe('TranslateJourneyMenuItem', () => {
  const handleCloseMenu = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('should render translate menu item', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <TranslateJourneyMenuItem
                id="journeyId"
                handleCloseMenu={handleCloseMenu}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('menuitem', { name: 'Translate' })).toBeInTheDocument()
  })

  it('should call handleCloseMenu when clicked', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <TranslateJourneyMenuItem
                id="journeyId"
                handleCloseMenu={handleCloseMenu}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Translate' }))
    expect(handleCloseMenu).toHaveBeenCalled()
  })

  // TODO: should render dialog on click
})
