import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { PageWrapper } from '.'

describe('PageWrapper', () => {
  it('should show title', () => {
    const { getByText } = render(
      <MockedProvider>
        <PageWrapper title="Journeys" />
      </MockedProvider>
    )
    expect(getByText('Journeys')).toBeInTheDocument()
  })

  it('should show back button', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <PageWrapper title="Journeys" backHref="/asdf" />
      </MockedProvider>
    )
    expect(getByTestId('backicon')).toBeInTheDocument()
  })

  it('should show children', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <PageWrapper title="Journeys">
          <div data-testid="test">Hello</div>
        </PageWrapper>
      </MockedProvider>
    )
    expect(getByTestId('test')).toHaveTextContent('Hello')
  })
})
