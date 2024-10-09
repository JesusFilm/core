import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { Items } from './Items'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Items', () => {
  it('should render items', () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <Items />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByTestId('AnalyticsItem')).toBeInTheDocument()
    expect(getByTestId('ResponsesItem')).toBeInTheDocument()
    expect(getByTestId('StrategyItem')).toBeInTheDocument()
    expect(getByTestId('ShareItem')).toBeInTheDocument()
    expect(getByTestId('PreviewItem')).toBeInTheDocument()
  })
})
