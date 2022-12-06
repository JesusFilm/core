import { render, fireEvent } from '@testing-library/react'
import { ContainerDescription } from './ContainerDescription'

describe('ContainerDescription', () => {
  const sampleText = 'This text should appear in the description'
  const setOpenShare = jest.fn()

  it('should render description text correctly', () => {
    const { getByText } = render(
      <ContainerDescription value={sampleText} setOpenShare={setOpenShare} />
    )
    expect(getByText(sampleText)).toBeInTheDocument()
  })

  it('should execute share button operation', () => {
    const { getByLabelText } = render(
      <ContainerDescription value={sampleText} setOpenShare={setOpenShare} />
    )
    fireEvent.click(getByLabelText('collection-share-button'))
    expect(setOpenShare).toHaveBeenCalled()
  })
})
