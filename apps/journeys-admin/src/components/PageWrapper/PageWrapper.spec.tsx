import { render } from '@testing-library/react'
import { PageWrapper } from './PageWrapper'

describe('PageWrapper', () => {
  it('should show title', () => {
    const { getByText } = render(<PageWrapper title="Journeys" />)
    expect(getByText('Journeys')).toBeInTheDocument()
  })

  it('should show back button', () => {
    const { getByRole } = render(<PageWrapper title="Journeys" backHref="/" />)
    expect(getByRole('link')).toHaveAttribute('href', '/')
  })

  it('should show custom menu', () => {
    const { getByText } = render(
      <PageWrapper title="Journeys" Menu={<>Custom Content</>} />
    )
    expect(getByText('Custom Content')).toBeInTheDocument()
  })

  it('should show children', () => {
    const { getByTestId } = render(
      <PageWrapper title="Journeys">
        <div data-testid="test">Hello</div>
      </PageWrapper>
    )
    expect(getByTestId('test')).toHaveTextContent('Hello')
  })
})
