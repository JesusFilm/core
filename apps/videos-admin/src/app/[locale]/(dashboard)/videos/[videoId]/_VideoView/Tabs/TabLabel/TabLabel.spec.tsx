import { render, screen } from '@testing-library/react'

import { TabLabel } from './TabLabel'

describe('TabLabel', () => {
  it('should show label and count', () => {
    render(<TabLabel label="hello" count={1} />)

    expect(screen.getByText('hello')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should not show count', () => {
    render(<TabLabel label="hello" />)

    expect(screen.queryByText('1')).not.toBeInTheDocument()
  })
})
