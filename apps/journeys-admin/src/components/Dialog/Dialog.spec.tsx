import { render } from '@testing-library/react'
import { Dialog } from './Dialog'

describe('Dialog', () => {
  it('update this test', () => {
    const { getByText } = render(<Dialog />)
    expect(getByText('Dialog')).toBeInTheDocument()
  })
})
