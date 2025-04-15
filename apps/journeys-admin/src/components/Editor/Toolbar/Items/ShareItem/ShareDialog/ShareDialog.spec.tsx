import { act, fireEvent, render, screen } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { ShareDialog } from './ShareDialog'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('ShareDialog', () => {
  const handleClose = jest.fn()
  const handleSlugDialogOpen = jest.fn()
  const handleEmbedDialogOpen = jest.fn()
  const handleQrCodeDialogOpen = jest.fn()
  const push = jest.fn()
  const on = jest.fn()

  const originalClipboard = { ...global.navigator.clipboard }
  const mockClipboard = {
    writeText: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: { on }
    } as unknown as NextRouter)

    Object.assign(navigator, {
      clipboard: mockClipboard
    })
  })

  afterEach(() => {
    Object.assign(navigator, {
      clipboard: originalClipboard
    })
  })

  interface ComponentProps {
    open?: boolean
    hostname?: string
  }

  const Component = ({
    open = true,
    hostname = 'my.custom.domain'
  }: ComponentProps): ReactElement => (
    <SnackbarProvider>
      <JourneyProvider value={{ journey: defaultJourney, variant: 'admin' }}>
        <ShareDialog
          open={open}
          onClose={handleClose}
          hostname={hostname}
          onSlugDialogOpen={handleSlugDialogOpen}
          onEmbedDialogOpen={handleEmbedDialogOpen}
          onQrCodeDialogOpen={handleQrCodeDialogOpen}
        />
      </JourneyProvider>
    </SnackbarProvider>
  )

  it('should render the dialog when open is true', () => {
    render(<Component />)
    expect(screen.getByText('Share This Journey')).toBeInTheDocument()
  })

  it('should not render the dialog when open is false', () => {
    render(<Component open={false} />)
    expect(screen.queryByText('Share This Journey')).not.toBeInTheDocument()
  })

  it('should call onClose when dialog is closed', () => {
    render(<Component />)
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(handleClose).toHaveBeenCalled()
  })

  it('should display the journey URL with custom domain', () => {
    render(<Component />)
    expect(
      screen.getByDisplayValue('https://my.custom.domain/default')
    ).toBeInTheDocument()
  })

  describe('clipboard functionality', () => {
    const originalEnv = process.env.NEXT_PUBLIC_JOURNEYS_URL

    beforeEach(() => {
      process.env.NEXT_PUBLIC_JOURNEYS_URL = 'https://test.nextstep.is'
    })

    afterEach(() => {
      process.env.NEXT_PUBLIC_JOURNEYS_URL = originalEnv
    })

    it.each([
      ['custom domain', 'my.custom.domain', 'https://my.custom.domain/default'],
      ['default domain', undefined, 'https://test.nextstep.is/default']
    ])('should copy URL with %s', async (_, hostname, expectedUrl) => {
      const { getByRole } = render(
        <SnackbarProvider>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareDialog
              open
              onClose={handleClose}
              hostname={hostname}
              onSlugDialogOpen={handleSlugDialogOpen}
              onEmbedDialogOpen={handleEmbedDialogOpen}
              onQrCodeDialogOpen={handleQrCodeDialogOpen}
            />
          </JourneyProvider>
        </SnackbarProvider>
      )

      await act(async () => {
        fireEvent.click(getByRole('button', { name: 'Copy' }))
        await Promise.resolve()
      })

      expect(mockClipboard.writeText).toHaveBeenCalledWith(expectedUrl)
    })
  })

  it('should call onSlugDialogOpen and set route when Edit URL button is clicked', () => {
    render(<Component />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit URL' }))
    expect(handleSlugDialogOpen).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith(
      { query: { param: 'edit-url' } },
      undefined,
      { shallow: true }
    )
  })

  it('should call onEmbedDialogOpen and set route when Embed Journey button is clicked', () => {
    render(<Component />)
    fireEvent.click(screen.getByRole('button', { name: 'Embed Journey' }))
    expect(handleEmbedDialogOpen).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith(
      { query: { param: 'embed-journey' } },
      undefined,
      { shallow: true }
    )
  })

  it('should call onQrCodeDialogOpen and set route when QR Code button is clicked', () => {
    render(<Component />)
    fireEvent.click(screen.getByRole('button', { name: 'QR Code' }))
    expect(handleQrCodeDialogOpen).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith(
      { query: { param: 'qr-code' } },
      undefined,
      { shallow: true }
    )
  })

  it('should set beacon page viewed on route change', () => {
    render(<Component />)
    fireEvent.click(screen.getByRole('button', { name: 'QR Code' }))
    expect(on).toHaveBeenCalledWith('routeChangeComplete', expect.any(Function))
    const callback = on.mock.calls[0][1]
    callback()
  })

  it('should disable all buttons and prevent clipboard access when journey is undefined', () => {
    render(
      <SnackbarProvider>
        <JourneyProvider value={{ journey: undefined, variant: 'admin' }}>
          <ShareDialog
            open
            onClose={handleClose}
            hostname={undefined}
            onSlugDialogOpen={handleSlugDialogOpen}
            onEmbedDialogOpen={handleEmbedDialogOpen}
            onQrCodeDialogOpen={handleQrCodeDialogOpen}
          />
        </JourneyProvider>
      </SnackbarProvider>
    )

    expect(screen.getByRole('button', { name: 'Edit URL' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Embed Journey' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'QR Code' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Copy' })).toBeDisabled()

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    })
    expect(mockClipboard.writeText).not.toHaveBeenCalled()
  })
})
