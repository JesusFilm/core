import { render } from '@testing-library/react'

import { PageWrapper } from './PageWrapper'

describe('PageWrapper', () => {
  it('should show nav drawer', () => {
    const { getByTestId } = render(<PageWrapper />)
    expect(getByTestId('NavigationDrawer')).toBeInTheDocument()
  })

  it('should show main header', () => {
    const { getByTestId } = render(<PageWrapper />)
    expect(getByTestId('main-header')).toBeInTheDocument()
  })

  it('should show main body children', () => {
    const { getByTestId } = render(
      <PageWrapper>
        <div>Child</div>
      </PageWrapper>
    )
    expect(getByTestId('main-body')).toHaveTextContent('Child')
  })
})
