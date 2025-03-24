import { render } from '@testing-library/react'

import { CollectionsPageContent } from './CollectionsPageContent'

describe('CollectionsPageContent', () => {
  it('should render correctly with all nested elements', () => {
    const { getByTestId } = render(<CollectionsPageContent />)

    const page = getByTestId('CollectionPage')
    expect(page).toBeInTheDocument()
    expect(page).toHaveClass('bg-stone-900 text-white min-h-screen font-sans')

    const blurFilter = getByTestId('CollectionPageBlurFilter')
    expect(blurFilter).toBeInTheDocument()
    expect(blurFilter).toHaveClass(
      'w-full mx-auto z-1 border-t border-stone-500/30'
    )

    const container = getByTestId('CollectionPageContainer')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('pt-7 w-full max-w-[1920px]')

    const content = getByTestId('CollectionPageContent')
    expect(content).toBeInTheDocument()
    expect(content).toHaveClass('min-h-screen')
  })

  it('should render children when provided', () => {
    const testId = 'test-child'
    const { getByTestId } = render(
      <CollectionsPageContent>
        <div data-testid={testId}>Test Child Content</div>
      </CollectionsPageContent>
    )

    // Check that the child component is rendered
    expect(getByTestId(testId)).toBeInTheDocument()
    expect(getByTestId(testId)).toHaveTextContent('Test Child Content')
  })
})
