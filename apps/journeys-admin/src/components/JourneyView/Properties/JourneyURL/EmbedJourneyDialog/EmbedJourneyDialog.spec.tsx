import { render, fireEvent, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { EmbedJourneyDialog } from './EmbedJourneyDialog'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('embedJourneyDialog', () => {
  const onClose = jest.fn()
  it('closes the modal on cancel click', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <EmbedJourneyDialog open onClose={onClose} />
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('should have the terms and conditions link', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <EmbedJourneyDialog open onClose={onClose} />
      </SnackbarProvider>
    )
    expect(getByText('Terms of agreement').closest('a')).toHaveAttribute(
      'href',
      'https://www.cru.org/us/en/about/terms-of-use.html'
    )
  })

  describe('copies embed code', () => {
    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn()
        }
      })
    })

    afterEach(() => {
      jest.resetAllMocks()
      Object.assign(navigator, { ...global.navigator })
    })

    it('should copy the embed code from the modal', async () => {
      const embedCode =
        '<div style="position: relative; width: 100%; overflow: hidden; padding-top: 150%;" id="jfm-iframe-container"><iframe src="your.nextstep.is/embed/undefined" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0; width: 100%; height: 100%; border: none;" allowfullscreen /></div>'
      const { getByText, getByRole } = render(
        <SnackbarProvider>
          <EmbedJourneyDialog open onClose={onClose} />
        </SnackbarProvider>
      )
      expect(getByRole('textbox')).toHaveValue(embedCode)
      fireEvent.click(getByRole('button', { name: 'Copy Code' }))
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(embedCode)
      await waitFor(() => expect(getByText('Code Copied')).toBeInTheDocument())
    })
  })
})
