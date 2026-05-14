import { render } from '@testing-library/react'

import { InstantSearchProvider } from './InstantSearchProvider'

vi.mock('algoliasearch')

describe('InstantSearchProvider', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <InstantSearchProvider>
        <div>Test Child</div>
      </InstantSearchProvider>
    )

    expect(getByText('Test Child')).toBeInTheDocument()
  })
})
