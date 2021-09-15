import { render } from '@testing-library/react'

import Typography from './Typography'

describe('Typography', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Typography content={'hello world'} />)
    expect(baseElement).toBeTruthy()
  })
})
