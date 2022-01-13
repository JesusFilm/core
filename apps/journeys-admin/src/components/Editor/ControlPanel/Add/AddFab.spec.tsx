import { render, fireEvent } from '@testing-library/react'
import { AddFab } from '.'

describe('Add Button', () => {
  it('should render the button', () => {
    const onClick = jest.fn()
    const { getByRole } = render(<AddFab visible onClick={onClick} />)

    const button = getByRole('button', { name: 'Add' })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalled()
  })

  it('should not show button if visible is false', () => {
    const { queryByRole } = render(<AddFab />)
    expect(queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
  })
})
