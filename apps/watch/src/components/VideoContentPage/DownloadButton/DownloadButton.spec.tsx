import { fireEvent, render } from '@testing-library/react'
import noop from 'lodash/noop'

import { DownloadButton } from './DownloadButton'

describe('DownloadButton', () => {
  it('should render button variant as button', () => {
    const { getByRole } = render(
      <DownloadButton variant="button" onClick={noop} />
    )
    expect(getByRole('button', { name: 'Download' })).toBeInTheDocument()
  })

  it('should render icon variant as icon', () => {
    const { getByTestId } = render(
      <DownloadButton variant="icon" onClick={noop} />
    )
    expect(getByTestId('FileDownloadOutlinedIcon')).toBeInTheDocument()
  })

  it('should call onClick when button is clicked', () => {
    const setOpenDownload = jest.fn()

    const { getByRole } = render(
      <DownloadButton variant="button" onClick={setOpenDownload} />
    )

    fireEvent.click(getByRole('button'))
    expect(setOpenDownload).toHaveBeenCalled()
  })

  it('should call onClick when icon is clicked', () => {
    const setOpenShare = jest.fn()

    const { getByTestId } = render(
      <DownloadButton variant="icon" onClick={setOpenShare} />
    )

    fireEvent.click(getByTestId('FileDownloadOutlinedIcon'))
    expect(setOpenShare).toHaveBeenCalled()
  })
})
