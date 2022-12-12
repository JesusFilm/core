import { render, fireEvent } from '@testing-library/react'
import { noop } from 'lodash'
import { ContainerDescription } from './ContainerDescription'

describe('ContainerDescription', () => {
  const sampleText = 'This text should appear in the description'

  it('should render description text correctly', () => {
    const { getByText } = render(
      <ContainerDescription value={sampleText} openDialog={noop} />
    )
    expect(getByText(sampleText)).toBeInTheDocument()
  })

  it('should execute share button operation', () => {
    const setOpenShare = jest.fn()

    const { getByLabelText } = render(
      <ContainerDescription value={sampleText} openDialog={setOpenShare} />
    )

    fireEvent.click(getByLabelText('collection-share-button'))
    expect(setOpenShare).toHaveBeenCalled()
  })
})
