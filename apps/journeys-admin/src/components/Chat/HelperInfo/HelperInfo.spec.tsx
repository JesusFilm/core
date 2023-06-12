import { render } from '@testing-library/react'
import { HelperInfo } from '.'

describe('HelperInfo', () => {
  it('renders the value prop', () => {
    const value = 'This is a helper message'
    const { getByText } = render(<HelperInfo value={value} />)
    expect(getByText(value)).toBeInTheDocument()
  })
})
