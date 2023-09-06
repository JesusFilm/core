import { fireEvent, render } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { ShareDialog } from './ShareDialog'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('ShareDialog', () => {
  it('should copy link', () => {
    const mockPromise = Promise.resolve()
    const writeTextMock = jest.fn().mockReturnValue(mockPromise)

    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    })
    jest.spyOn(mockPromise, 'then').mockImplementation(writeTextMock)

    const { getByTestId } = render(
      <SnackbarProvider>
        <ShareDialog url="test-slug" open closeDialog={noop} />
      </SnackbarProvider>
    )

    fireEvent.click(getByTestId('LinkAngledIcon'))
    expect(writeTextMock).toHaveBeenCalled()
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
