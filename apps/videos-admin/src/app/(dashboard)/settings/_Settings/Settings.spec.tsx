import { render, screen } from '@testing-library/react'

import { Settings } from './Settings'

describe('Settings', () => {
  it('should render settings', () => {
    render(<Settings />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Settings'
    )
  })
})
