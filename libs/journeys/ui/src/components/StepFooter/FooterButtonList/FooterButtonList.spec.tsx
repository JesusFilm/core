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
      <SnackbarProvider>
        <FooterButtonList />
      </SnackbarProvider>
    )
    expect(getByTestId('ShareIcon')).toBeInTheDocument()
  })

  it('should show like and dislike button', () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <FooterButtonList />
      </SnackbarProvider>
    )
    expect(getByTestId('ThumbsUpIcon')).toBeInTheDocument()
    expect(getByTestId('ThumbsDownIcon')).toBeInTheDocument()
  })
})
