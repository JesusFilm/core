import { render, fireEvent } from '@testing-library/react'
import { AddFab } from '.'

describe('AddFab', () => {
  it('should render the fab', () => {
    const onClick = jest.fn()
    const { getByRole } = render(<AddFab visible onClick={onClick} />)

    const button = getByRole('button', { name: 'Add' })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalled()
  })

  it('should not show fab if visible is false', () => {
    const { queryByRole } = render(<AddFab />)
    expect(queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
  })
})
