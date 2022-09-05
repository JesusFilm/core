import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { SnackbarProvider } from 'notistack'
import { defaultJourney } from '../data'
import { JourneyLink } from './JourneyLink'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('JourneyLink', () => {
  it('should handle edit journey slug', async () => {
    const { getAllByRole, getByRole, queryByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <FlagsProvider>
            <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
              <JourneyLink />
            </JourneyProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getAllByRole('button', { name: 'Edit URL' })[0])
    expect(getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('should handle embed journey', async () => {
    const { getAllByRole, getByRole, queryByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <FlagsProvider>
            <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
              <JourneyLink />
            </JourneyProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getAllByRole('button', { name: 'Embed Journey' })[0])
    expect(getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument())
  })
})
