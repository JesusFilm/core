import { render, fireEvent } from '@testing-library/react'
import { noop } from 'lodash'
import { ShareButton } from './ShareButton'

describe('ShareButton', () => {
  it('should render share button based on variant correctly', () => {
    const { getByText } = render(
      <ShareButton variant="button" openDialog={noop} />
    )
    expect(getByText('Share')).toBeInTheDocument()
  })

  it('should render icon button based on variant correctly', () => {
    const { getByLabelText } = render(
      <ShareButton variant="icon" openDialog={noop} />
    )
    expect(getByLabelText('share-icon')).toBeInTheDocument()
  })

  it('should execute share button operation', () => {
    const setOpenShare = jest.fn()

    const { getByLabelText } = render(
      <ShareButton variant="button" openDialog={setOpenShare} />
    )

    fireEvent.click(getByLabelText('share-button'))
    expect(setOpenShare).toHaveBeenCalled()
  })
})
