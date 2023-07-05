import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { FooterButtons } from './FooterButtons'

describe('FooterButtons', () => {
  it('should show share button', () => {
    const { getAllByTestId } = render(
      <SnackbarProvider>
        <FooterButtons />
      </SnackbarProvider>
    )
    expect(getAllByTestId('ShareIcon')).toHaveLength(2)
  })
})
