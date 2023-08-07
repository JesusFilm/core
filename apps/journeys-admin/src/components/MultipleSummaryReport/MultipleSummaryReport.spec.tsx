import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { MultipleSummaryReport } from './MultipleSummaryReport'

describe('MultipleSummaryReport', () => {
  it('should render', async () => {
    const { getByText, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <MultipleSummaryReport />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByText('Reports')).toBeInTheDocument()
    expect(getByText('See all')).toBeInTheDocument()
    await waitFor(() =>
      expect(getByTestId('powerBi-multipleSummary-report')).toBeInTheDocument()
    )
  })
})
