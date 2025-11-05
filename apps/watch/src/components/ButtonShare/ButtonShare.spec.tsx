import { fireEvent, render } from '@testing-library/react'
import noop from 'lodash/noop'

import { ButtonShare } from './ButtonShare'

describe('ButtonShare', () => {
  it('should render button variant as button', () => {
    const { getByRole } = render(
      <ButtonShare variant="button" onClick={noop} />
    )
    expect(getByRole('button', { name: 'Share' })).toBeInTheDocument()
  })

  it('should render icon variant as icon', () => {
    const { getByTestId } = render(
      <ButtonShare variant="icon" onClick={noop} />
    )
    expect(getByTestId('ShareOutlinedIcon')).toBeInTheDocument()
  })

  it('should call onClick when button is clicked', () => {
    const setOpenShare = jest.fn()

    const { getByRole } = render(
      <ButtonShare variant="button" onClick={setOpenShare} />
    )

    fireEvent.click(getByRole('button'))
    expect(setOpenShare).toHaveBeenCalled()
  })

  it('should call onClick when icon is clicked', () => {
    const setOpenShare = jest.fn()

    const { getByTestId } = render(
      <ButtonShare variant="icon" onClick={setOpenShare} />
    )

    fireEvent.click(getByTestId('ShareOutlinedIcon'))
    expect(setOpenShare).toHaveBeenCalled()
  })
})
