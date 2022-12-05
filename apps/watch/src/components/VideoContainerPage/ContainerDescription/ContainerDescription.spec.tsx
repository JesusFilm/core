import { render, fireEvent } from '@testing-library/react'
import { ContainerDescription } from './ContainerDescription'

describe('ContainerDescription', () => {
  const sampleText = 'This text should appear in the description'

  it('should render description text correctly', () => {
    const { getByText } = render(
      <ContainerDescription value={sampleText} setOpenShare={jest.fn()} />
    )
    expect(getByText(sampleText)).toBeInTheDocument()
  })

  it('should render button text correctly', () => {
    const { getByLabelText } = render(
      <ContainerDescription value={sampleText} setOpenShare={jest.fn()} />
    )
    const shareButton = getByLabelText('collection-share-button')
    expect(shareButton).toHaveTextContent('Share')
  })

  it('should execute share button operation', () => {
    const setOpenShare = jest.fn()
    const { getByLabelText } = render(
      <ContainerDescription value={sampleText} setOpenShare={setOpenShare} />
    )
    fireEvent.click(getByLabelText('collection-share-button'))
    expect(setOpenShare).toHaveBeenCalled()
  })
})
