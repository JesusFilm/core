import { fireEvent, render, screen } from '@testing-library/react'

import Cursor6Icon from '@core/shared/ui/icons/Cursor6'

import { Button } from '.'

describe('Button', () => {
  it('should render button', () => {
    render(<Button icon={<Cursor6Icon />} value="test value" />)
    expect(screen.getByText('test value')).toBeInTheDocument()
    expect(screen.getByTestId('Cursor6Icon')).toBeInTheDocument()
    expect(screen.getByTestId('Plus2Icon')).toBeInTheDocument()
  })

  it('should handle click', () => {
    const handleClick = jest.fn()

    render(
      <Button icon={<Cursor6Icon />} value="test value" onClick={handleClick} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'test value' }))
    expect(handleClick).toHaveBeenCalled()
  })
})
