import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { EmbedJourney } from '.'

describe('EmbedJourney', () => {
  it('should handle click for embed journey', () => {
    window.open = jest.fn()
    const { getByText, getByLabelText } = render(
      <SnackbarProvider>
        <EmbedJourney slug="admin-center">
          children of embed journey
        </EmbedJourney>
      </SnackbarProvider>
    )
    expect(getByText('children of embed journey')).toBeInTheDocument()
    fireEvent.click(getByLabelText('admin-center-embedded'))
    expect(window.open).toHaveBeenCalledWith(
      'https://your.nextstep.is/admin-center'
    )
  })
})
