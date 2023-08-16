import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { defaultJourney } from '../../../../JourneyView/data'
import { ThemeProvider } from '../../../../ThemeProvider'

import { TitleMenuItem } from './TitleMenuItem'

describe('TitleMenuItem', () => {
  it('should open edit title dialog', async () => {
    const onClose = jest.fn()
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <ThemeProvider>
              <TitleMenuItem onClose={onClose} />
            </ThemeProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Title' }))
    expect(getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })
})
