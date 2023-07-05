import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { FooterButtons } from './FooterButtons'

describe('FooterButtons', () => {
  it('should show share button', () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <FooterButtons />
      </SnackbarProvider>
    )
    expect(getByTestId('ShareIcon')).toBeInTheDocument()
  })
})
