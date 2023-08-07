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
      const embedCode = `<div style="position: relative; width: 100%; overflow: hidden; padding-top: 150%;"><iframe  id="jfm-iframe" src="${
        process.env.NEXT_PUBLIC_JOURNEYS_URL as string
      }/embed/undefined" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0; width: 100%; height: 100%; border: none;" allow="fullscreen"></iframe></div><script>window.addEventListener('message', event => { if(event.origin==='https://your.nextstep.is'){ const iframe=document.getElementById('jfm-iframe')
if(event.data === true){ 
iframe.style.position="fixed"
iframe.style.zIndex="999999999999999999999"
} else {
iframe.style.position="absolute"
iframe.style.zIndex="auto"
}}})</script>`
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
