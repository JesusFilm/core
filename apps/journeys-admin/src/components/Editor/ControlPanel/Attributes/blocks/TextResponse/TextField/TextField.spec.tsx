import { render } from '@testing-library/react'
import { TextField } from './TextField'

describe('TextField', () => {
  it('should show text field properties', () => {
    const { getByText } = render(<TextField />)
    expect(getByText('Text field properties')).toBeInTheDocument()
  })
})
