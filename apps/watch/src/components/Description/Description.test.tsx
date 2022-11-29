import { render, screen } from '@testing-library/react'
import { Description } from './Description'

describe('Description', () => {
  const sampleText = 'This text should appear in the description'

  it('should render description text correctly', () => {
    render(<Description value={sampleText} />)
    const testText = screen.getByText(sampleText)
    expect(testText).toBeInTheDocument()
  })

  it('should render button text correctly', () => {
    render(<Description value={sampleText} />)
    const shareButton = screen.getByLabelText('collection-share-button')
    expect(shareButton).toHaveTextContent('Share')
  })
})
