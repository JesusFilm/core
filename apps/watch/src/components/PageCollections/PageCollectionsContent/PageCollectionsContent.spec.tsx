import { render } from '@testing-library/react'

import { PageCollectionsContent } from './PageCollectionsContent'

describe('PageCollectionsContent', () => {
  it('should render correctly with all nested elements', () => {
    const { getByTestId } = render(<PageCollectionsContent />)

    const content = getByTestId('CollectionPageContent')
    expect(content).toBeInTheDocument()
  })

  it('should render children when provided', () => {
    const testId = 'test-child'
    const testId2 = 'test-child2'
    const { getByTestId } = render(
      <PageCollectionsContent>
        <div data-testid={testId}>{'Test Child Content'}</div>
        <div data-testid={testId2}>{'Test Child Content 2'}</div>
      </PageCollectionsContent>
    )

    expect(getByTestId(testId)).toHaveTextContent('Test Child Content')
    expect(getByTestId(testId2)).toHaveTextContent('Test Child Content 2')
  })
})
