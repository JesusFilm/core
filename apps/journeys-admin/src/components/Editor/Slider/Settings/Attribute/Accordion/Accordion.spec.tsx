import { render } from '@testing-library/react'

describe('Accordion', () => {
  it('should render accordion', () => {
    const { getByRole } = render(<></>)

    expect(getByRole('heading', { name: 'Accordion' })).toBeInTheDocument()
  })
})
