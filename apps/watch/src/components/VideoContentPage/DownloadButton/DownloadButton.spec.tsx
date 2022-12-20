import { render, fireEvent } from '@testing-library/react'
import { noop } from 'lodash'
import { DownloadButton } from './DownloadButton'

describe('DownloadButton', () => {
  it('should render download button based on variant correctly', () => {
    const { getByRole } = render(
      <DownloadButton variant="button" onClick={noop} />
    )
    expect(getByRole('button', { name: 'Download' })).toBeInTheDocument()
  })

  it('should render icon button based on variant correctly', () => {
    const { getByTestId } = render(
      <DownloadButton variant="icon" onClick={noop} />
    )
    expect(getByTestId('FileDownloadOutlinedIcon')).toBeInTheDocument()
  })

  it('should execute download button operation', () => {
    const setOpenDownload = jest.fn()

    const { getByRole } = render(
      <DownloadButton variant="button" onClick={setOpenDownload} />
    )

    fireEvent.click(getByRole('button'))
    expect(setOpenDownload).toHaveBeenCalled()
  })
})
