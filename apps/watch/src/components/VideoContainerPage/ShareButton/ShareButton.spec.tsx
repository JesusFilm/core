import { render, fireEvent } from '@testing-library/react'
import { noop } from 'lodash'
import { ShareButton } from './ShareButton'

describe('ShareButton', () => {
  it('should render share button based on variant correctly', () => {
    const { getByRole } = render(
      <ShareButton variant="button" openDialog={noop} />
    )
    expect(getByRole('button', { name: 'Share' })).toBeInTheDocument()
  })

  it('should render icon button based on variant correctly', () => {
    const { getByTestId } = render(
      <ShareButton variant="icon" openDialog={noop} />
    )
    expect(getByTestId('ShareOutlinedIcon')).toBeInTheDocument()
  })

  it('should execute share button operation', () => {
    const setOpenShare = jest.fn()

    const { getByRole } = render(
      <ShareButton variant="button" openDialog={setOpenShare} />
    )

    fireEvent.click(getByRole('button'))
    expect(setOpenShare).toHaveBeenCalled()
  })
})
