import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { FooterButtonList } from './FooterButtonList'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('FooterButtonList', () => {
  it('should show share button', () => {
    const { getAllByTestId } = render(
      <SnackbarProvider>
        <FooterButtonList />
      </SnackbarProvider>
    )
    expect(getAllByTestId('ShareIcon')).toHaveLength(1)
  })
})
