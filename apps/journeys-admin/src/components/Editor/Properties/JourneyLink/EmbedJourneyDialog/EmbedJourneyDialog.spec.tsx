import { fireEvent, render, waitFor } from '@testing-library/react'
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
    const originalEnv = process.env

    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn()
        }
      })
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_JOURNEYS_URL: 'http://localhost:4100'
      }
    })

    afterEach(() => {
      jest.resetAllMocks()
      Object.assign(navigator, { ...global.navigator })
      process.env = originalEnv
    })

    it('should copy the embed code from the modal', async () => {
      const embedCode = `<iframe src="https://${process.env.NEXT_PUBLIC_JOURNEYS_URL}/embed/undefined" style="border: 0" allow="fullscreen; autoplay" allowfullscreen></iframe>`
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
