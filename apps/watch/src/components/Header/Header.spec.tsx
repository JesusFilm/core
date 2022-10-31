import { render, fireEvent } from '@testing-library/react'
import { Header } from './Header'

describe('Header', () => {
  it('should open navigation panel on menu icon click', () => {
    const { getByTestId, getByText } = render(<Header />)
    fireEvent.click(getByTestId('MenuIcon'))
    expect(getByText('About')).toBeInTheDocument()
  })
})
