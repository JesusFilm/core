import React from 'react'
import { render } from '@testing-library/react'

import Slug from '../pages/[slug]'

describe('Slug', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Slug />)
    expect(baseElement).toBeTruthy()
  })
})
