import { render, fireEvent } from '@testing-library/react'
import { Header } from './Header'

describe('Header', () => {
  it('should open navigation panel on menu icon click', () => {
    const { getByText, getByRole } = render(<Header />)

    fireEvent.click(getByRole('button', { name: 'open header menu' }))

    expect(getByText('About')).toBeInTheDocument()
  })
})
