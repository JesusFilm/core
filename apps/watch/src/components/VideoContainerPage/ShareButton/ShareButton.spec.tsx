import { render, fireEvent } from '@testing-library/react'
import { noop } from 'lodash'
import { ShareButton } from './ShareButton'

describe('ShareButton', () => {
  it('should render description text correctly', () => {
    const { getByText } = render(
      <ShareButton value={sampleText} openDialog={noop} />
    )
    expect(getByText(sampleText)).toBeInTheDocument()
  })

  it('should execute share button operation', () => {
    const setOpenShare = jest.fn()

    const { getByLabelText } = render(
      <ShareButton value={sampleText} openDialog={setOpenShare} />
    )

    fireEvent.click(getByLabelText('collection-share-button'))
    expect(setOpenShare).toHaveBeenCalled()
  })
})
