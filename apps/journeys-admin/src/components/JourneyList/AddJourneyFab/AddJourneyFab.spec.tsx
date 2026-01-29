import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { PageWrapper } from '../../PageWrapper'

import { AddJourneyFab } from './AddJourneyFab'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('AddJourneyFab', () => {
  // Cannot test mobile in unit test until we can useMediaQuery because sx uses CSS media queries, which JSDOM does not evaluate
  it('should open side panel drawer on fab click', async () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider>
        <PageWrapper
          title="test open side drawer"
          sidePanelTitle="test side panel title"
          sidePanelChildren={<div>test side panel children</div>}
        >
          <AddJourneyFab />
        </PageWrapper>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Add' })).toBeInTheDocument()

    expect(() => getByTestId('mobile-side-panel')).toThrow()
    fireEvent.click(getByRole('button', { name: 'Add' }))

    await waitFor(() =>
      expect(getByTestId('mobile-side-panel')).toBeInTheDocument()
    )

    fireEvent.click(getByTestId('close-side-drawer'))

    await waitFor(() => {
      expect(() => getByTestId('mobile-side-panel')).toThrow()
    })
  })
})
