import { render } from '@testing-library/react'
import React from 'react'

import { Container } from './container'

describe('Container', () => {
  it('renders children with default classes', () => {
    const { getByText } = render(<Container>Content</Container>)
    const element = getByText('Content')
    expect(element).toHaveClass('mx-auto w-full max-w-7xl px-4 md:px-6')
  })

  it('merges custom className', () => {
    const { getByText } = render(<Container className="custom">Content</Container>)
    const element = getByText('Content')
    expect(element).toHaveClass('custom')
  })
})
