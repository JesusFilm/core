import { render, screen } from '@testing-library/react'

import { Dashboard } from './Dashboard'

describe('Dashboard', () => {
  it('should render Dashboard', () => {
    render(
      
        <Dashboard />
      
    )

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Dashboard'
    )
  })
})
