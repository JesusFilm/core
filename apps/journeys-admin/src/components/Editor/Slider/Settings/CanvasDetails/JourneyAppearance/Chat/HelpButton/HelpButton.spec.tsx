import { render, fireEvent, screen } from '@testing-library/react'

import { HelpButton } from '.'

describe('HelpButton', () => {
  window.open = jest.fn()
  it('should open link in a new tab upon clicking', () => {
    render(<HelpButton />)

    expect(screen.getByTestId('JourneysAdminHelpButton')).toHaveTextContent(
      'Learn how to get your direct chat link for any platform'
    )
    fireEvent.click(screen.getByRole('button'))
    expect(window.open).toHaveBeenCalledWith(
      'https://support.nextstep.is/article/1356-hosted-by-and-chat-widget',
      '_blank'
    )
  })
})
