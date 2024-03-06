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
    expect(getByTestId('Analytics-Item')).toBeInTheDocument()
    expect(getByTestId('Strategy-Item')).toBeInTheDocument()
    expect(getByTestId('Share-Item')).toBeInTheDocument()
    expect(getByTestId('Preview-Item')).toBeInTheDocument()
  })
})
