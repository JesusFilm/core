import { render } from '@testing-library/react'

import { CollectionsPageContent } from './CollectionsPageContent'

describe('CollectionsPageContent', () => {
  it('should render correctly with all nested elements', () => {
    const { getByTestId } = render(<CollectionsPageContent />)

    const page = getByTestId('CollectionPage')
    expect(page).toBeInTheDocument()

    const blurFilter = getByTestId('CollectionPageBlurFilter')
    expect(blurFilter).toBeInTheDocument()

    const container = getByTestId('CollectionPageContainer')
    expect(container).toBeInTheDocument()

    const content = getByTestId('CollectionPageContent')
    expect(content).toBeInTheDocument()
  })

  it('should render children when provided', () => {
    const testId = 'test-child'
    const testId2 = 'test-child2'
    const { getByTestId } = render(
      <CollectionsPageContent>
        <div data-testid={testId}>{'Test Child Content'}</div>
        <div data-testid={testId2}>{'Test Child Content 2'}</div>
      </CollectionsPageContent>
    )

    expect(getByTestId(testId)).toHaveTextContent('Test Child Content')
    expect(getByTestId(testId2)).toHaveTextContent('Test Child Content 2')
  })
})
