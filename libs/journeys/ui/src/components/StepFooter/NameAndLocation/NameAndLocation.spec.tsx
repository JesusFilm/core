import { render } from '@testing-library/react'
import { NameAndLocation } from './NameAndLocation'

describe('NameAndLocation', () => {
  it('renders the name and location correctly', () => {
    const props = {
      name: 'Edmond Shen',
      location: 'Student Life',
      rtl: false
    }

    const { getByText } = render(<NameAndLocation {...props} />)

    expect(getByText('Edmond Shen · Student Life')).toBeInTheDocument()
  })

  it('renders RTL correctly', () => {
    const props = {
      name: 'Edmond Shen',
      location: 'Student Life',
      rtl: true
    }

    const { getByText } = render(<NameAndLocation {...props} />)

    expect(getByText('Student Life · Edmond Shen')).toBeInTheDocument()
  })

  it('renders only the name when location is not provided', () => {
    const props = {
      name: 'John Doe',
      rtl: false
    }

    const { getByText, queryByText } = render(<NameAndLocation {...props} />)

    const nameElement = getByText('John Doe')
    const locationElement = queryByText(' · New York')

    expect(nameElement).toBeInTheDocument()
    expect(locationElement).toBeNull()
  })
})
