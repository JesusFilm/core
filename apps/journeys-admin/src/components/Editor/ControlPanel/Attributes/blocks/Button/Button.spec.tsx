import { render } from '@testing-library/react'
import { Button } from '.'

describe('Button attributes', () => {
  it('should be a test', () => {
    render(<Button />)
    expect(true).toBe(true)
  })
})
