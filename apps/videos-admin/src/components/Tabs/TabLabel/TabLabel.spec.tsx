import { render, screen } from '@testing-library/react'

import { TabLabel } from './TabLabel'

describe('TabLabel', () => {
  it('should render', () => {
    render(<TabLabel label="Tab label" />)

    expect(screen.getByText('Tab label')).toBeInTheDocument()
    expect(screen.queryByText('100')).not.toBeInTheDocument()
  })

  it('should render with count', () => {
    render(<TabLabel label="Tab label" count={100} />)

    expect(screen.getByText('Tab label')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })
})
