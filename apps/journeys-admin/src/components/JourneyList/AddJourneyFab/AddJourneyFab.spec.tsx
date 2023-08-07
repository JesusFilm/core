import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { PageWrapper } from '../../NewPageWrapper'

import { AddJourneyFab } from './AddJourneyFab'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('AddJourneyFab', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  // Cannot test mobile in unit test until we can useMediaQuery
  it.skip('should open side panel drawer on fab click', async () => {
    const { getByRole, getByTestId } = render(
      <FlagsProvider>
        <MockedProvider>
          <PageWrapper title="test open side drawer">
            <AddJourneyFab />
          </PageWrapper>
        </MockedProvider>
      </FlagsProvider>
    )
    expect(getByRole('button', { name: 'Add' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Add' }))

    await waitFor(() =>
      expect(getByTestId('mobile-side-drawer')).toBeInTheDocument()
    )
  })
})
