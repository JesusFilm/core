import { render } from '@testing-library/react'
import { ControlPanel } from '.'

describe('ControlPanel', () => {
  it('should render the element', () => {
    const { getByText } = render(<ControlPanel steps={[]} />)
    expect(getByText('ControlPanel')).toBeInTheDocument()
  })
})
