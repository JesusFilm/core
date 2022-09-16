import { render } from '@testing-library/react'
import { NewTextResponseButton } from './NewTextResponseButton'

describe('NewTextResponseButton', () => {
  it('should render', () => {
    const { getByText } = render(<NewTextResponseButton />)
    expect(getByText('Text Field')).toBeInTheDocument()
  })
})
