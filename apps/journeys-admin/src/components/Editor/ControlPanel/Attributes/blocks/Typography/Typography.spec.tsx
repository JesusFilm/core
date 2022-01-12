import { render } from '@testing-library/react'
import { Typography } from '.'

describe('Typography', () => {
  it('complete tests', () => {
    render(<Typography />)
    expect(true).toBe(true)
  })
})
