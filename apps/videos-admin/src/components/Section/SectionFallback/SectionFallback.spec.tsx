import { render, screen } from '@testing-library/react'

import { SectionFallback } from './SectionFallback'

describe('SectionFallback', () => {
  it('should render message', () => {
    render(<SectionFallback message="Hello world" loading={false} />)

    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('should render spinner if loading', () => {
    render(<SectionFallback message="Hello world" loading />)

    expect(screen.queryByText('Hello world')).not.toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})
