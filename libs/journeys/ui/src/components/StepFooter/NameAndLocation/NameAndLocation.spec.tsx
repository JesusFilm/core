import { render } from '@testing-library/react'
import { NameAndLocation } from './NameAndLocation'

describe('NameAndLocation', () => {
  const mockProps = {
    name: 'Edmond Shen',
    location: 'Student Life',
    rtl: false,
    src1: undefined,
    src2: undefined,
    admin: true
  }
  it('renders the name and location correctly', () => {
    const { getByText } = render(<NameAndLocation {...mockProps} />)

    expect(getByText('Edmond Shen · Student Life')).toBeInTheDocument()
  })

  it('renders RTL correctly', () => {
    const props = {
      ...mockProps,
      rtl: true
    }

    const { getByText } = render(<NameAndLocation {...props} />)

    expect(getByText('Student Life · Edmond Shen')).toBeInTheDocument()
  })

  it('renders only the name when location is not provided', () => {
    const props = {
      ...mockProps,
      location: undefined
    }

    const { getByText, queryByText } = render(<NameAndLocation {...props} />)

    const nameElement = getByText('Edmond Shen')
    const locationElement = queryByText(' · Student Life')

    expect(nameElement).toBeInTheDocument()
    expect(locationElement).toBeNull()
  })
})
