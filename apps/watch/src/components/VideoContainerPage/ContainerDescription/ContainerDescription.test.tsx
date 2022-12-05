import { render, screen } from '@testing-library/react'
import { ContainerDescription } from './ContainerDescription'

describe('ContainerDescription', () => {
  const sampleText = 'This text should appear in the description'

  it('should render description text correctly', () => {
    render(<ContainerDescription value={sampleText} setOpenShare={jest.fn()} />)
    const testText = screen.getByText(sampleText)
    expect(testText).toBeInTheDocument()
  })

  it('should render button text correctly', () => {
    render(<ContainerDescription value={sampleText} setOpenShare={jest.fn()} />)
    const shareButton = screen.getByLabelText('collection-share-button')
    expect(shareButton).toHaveTextContent('Share')
  })
})
