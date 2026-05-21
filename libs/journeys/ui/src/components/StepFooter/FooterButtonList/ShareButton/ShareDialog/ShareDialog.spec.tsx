import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { ShareDialog } from './ShareDialog'

describe('ShareDialog', () => {
  it('should copy link', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)

    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    })

    const { getByTestId } = render(
      <SnackbarProvider>
        <ShareDialog url="test-slug" open closeDialog={noop} />
      </SnackbarProvider>
    )

    fireEvent.click(getByTestId('LinkAngledIcon'))
    await waitFor(() => expect(writeTextMock).toHaveBeenCalledWith('test-slug'))
  })

  it('should share to facebook', () => {
    const { getAllByRole } = render(
      <SnackbarProvider>
        <ShareDialog url="test-slug" open closeDialog={noop} />
      </SnackbarProvider>
    )

    expect(getAllByRole('link')[0]).toHaveAttribute(
      'href',
      'https://www.facebook.com/sharer/sharer.php?u=test-slug'
    )
  })

  it('should share to twitter', () => {
    const { getAllByRole } = render(
      <SnackbarProvider>
        <ShareDialog url="test-slug" open closeDialog={noop} />
      </SnackbarProvider>
    )

    expect(getAllByRole('link')[1]).toHaveAttribute(
      'href',
      'https://twitter.com/intent/tweet?url=test-slug'
    )
  })
})
