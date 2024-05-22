import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { FooterButtonList } from './FooterButtonList'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('FooterButtonList', () => {
  it('should show share button', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <FooterButtonList />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByTestId('ShareIcon')).toBeInTheDocument()
  })

  it('should show like and dislike button', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <FooterButtonList />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByTestId('ThumbsUpIcon')).toBeInTheDocument()
    expect(getByTestId('ThumbsDownIcon')).toBeInTheDocument()
  })
})
