import { fireEvent, render, screen } from '@testing-library/react'

import { CodeDestination } from './CodeDestination'

describe('CodeDestination', () => {
  const handleChangeTo = jest.fn()

  it('should display the code destination', async () => {
    render(<CodeDestination handleChangeTo={handleChangeTo} to="someUrl" />)

    expect(screen.getByRole('textbox')).toHaveValue('someUrl')
  })

  it('should show redirect button when change button is clicked', async () => {
    render(
      <CodeDestination
        handleChangeTo={handleChangeTo}
        to="someUrl"
        disabled={false}
      />
    )
    expect(
      screen.queryByRole('button', { name: 'Redirect' })
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'Change' })[0])
    expect(
      screen.getAllByRole('button', { name: 'Redirect' })[0]
    ).toBeInTheDocument()
  })
})
