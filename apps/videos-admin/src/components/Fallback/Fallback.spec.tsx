import { render, screen } from '@testing-library/react'

import Lock1 from '@core/shared/ui/icons/Lock1'

import { Fallback } from './Fallback'

describe('Fallback', () => {
  it('should render', () => {
    render(<Fallback title="Fallback" subtitle="Fallback subtitle" />)

    expect(screen.getByText('Fallback')).toBeInTheDocument()
    expect(screen.getByText('Fallback subtitle')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByTestId('Lock1Icon')).not.toBeInTheDocument()
  })

  it('should render with action', () => {
    render(
      <Fallback
        title="Fallback"
        subtitle="Fallback subtitle"
        action={{ href: '/', label: 'Action' }}
      />
    )

    expect(screen.getByText('Fallback')).toBeInTheDocument()
    expect(screen.getByText('Fallback subtitle')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })

  it('should render with icon', () => {
    render(
      <Fallback
        title="Fallback"
        subtitle="Fallback subtitle"
        icon={<Lock1 />}
      />
    )

    expect(screen.getByText('Fallback')).toBeInTheDocument()
    expect(screen.getByText('Fallback subtitle')).toBeInTheDocument()
    expect(screen.getByTestId('Lock1Icon')).toBeInTheDocument()
  })
})
