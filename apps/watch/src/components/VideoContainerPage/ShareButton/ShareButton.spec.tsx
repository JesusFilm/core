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
    const { getByTestId } = render(
      <ShareButton variant="icon" openDialog={noop} />
    )
    expect(getByTestId('share-icon')).toBeInTheDocument()
  })

  it('should execute share button operation', () => {
    const setOpenShare = jest.fn()

    const { getByTestId } = render(
      <ShareButton variant="button" openDialog={setOpenShare} />
    )

    fireEvent.click(getByTestId('share-button'))
    expect(setOpenShare).toHaveBeenCalled()
  })
})
