import { render, screen } from '@testing-library/react'

import { ScanCount } from './ScanCount'

describe('ScanCount', () => {
  it('should render the scan count', () => {
    render(<ScanCount />)

    expect(screen.getByText('0 scans')).toBeInTheDocument()
  })
})
