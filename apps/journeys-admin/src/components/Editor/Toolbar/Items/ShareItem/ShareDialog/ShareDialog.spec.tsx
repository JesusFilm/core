import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { getCustomDomainMock } from '../../../../../../libs/useCustomDomainsQuery/useCustomDomainsQuery.mock'
import { ThemeProvider } from '../../../../../ThemeProvider'

import { ShareDialog } from './ShareDialog'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('ShareDialog', () => {
  const handleClose = jest.fn()
  const on = jest.fn()
  const push = jest.fn()
  const originalClipboard = { ...global.navigator.clipboard }
  const mockClipboard = {
    writeText: jest.fn()
  }

  let originalEnv

  beforeEach(() => {
    jest.clearAllMocks()
    originalEnv = process.env

    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: 'https://my.custom.domain'
    }

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
    process.env = originalEnv
  })

  interface TestShareDialogProps {
    open?: boolean
  }

  const TestShareDialog = ({
    open = true
  }: TestShareDialogProps): ReactElement => (
    <ThemeProvider>
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareDialog open={open} onClose={handleClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    </ThemeProvider>
  )

  it('should render the dialog when open is true', async () => {
    render(<TestShareDialog />)
    await act(async () => {
      expect(screen.getByText('Share This Journey')).toBeInTheDocument()
    })
  })

  it('should not render the dialog when open is false', async () => {
    render(<TestShareDialog open={false} />)
    await act(async () => {
      expect(screen.queryByText('Share This Journey')).not.toBeInTheDocument()
    })
  })

  it('should call onClose when dialog is closed', async () => {
    render(<TestShareDialog />)
    await act(async () => {
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    })
    expect(handleClose).toHaveBeenCalled()
  })

  it('should display the journey URL', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: { on }
    } as unknown as NextRouter)

    render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <ShareDialog open onClose={handleClose} />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )

    await waitFor(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://my.custom.domain/default'
    )
    expect(screen.getByText('Link copied')).toBeInTheDocument()
  })

  it('should display the journey URL with custom domain', async () => {
    const result = jest.fn().mockReturnValue(getCustomDomainMock.result)
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: { on }
    } as unknown as NextRouter)

    render(
      <ThemeProvider>
        <MockedProvider mocks={[{ ...getCustomDomainMock, result }]}>
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: {
                  ...defaultJourney,
                  team: {
                    id: 'teamId',
                    __typename: 'Team',
                    title: 'Team Title',
                    publicTitle: 'Team Title'
                  }
                },
                variant: 'admin'
              }}
            >
              <ShareDialog open onClose={handleClose} />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())

    await waitFor(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://example.com/default'
    )
    expect(screen.getByText('Link copied')).toBeInTheDocument()
  })

  it('should call onSlugDialogOpen and set route when Edit URL button is clicked', async () => {
    render(<TestShareDialog />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Edit URL' }))
    })
    expect(push).toHaveBeenCalledWith(
      { query: { param: 'edit-url' } },
      undefined,
      { shallow: true }
    )
  })

  it('set route when Embed Journey button is clicked', async () => {
    render(<TestShareDialog />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Embed Journey' }))
    })
    expect(push).toHaveBeenCalledWith(
      { query: { param: 'embed-journey' } },
      undefined,
      { shallow: true }
    )
  })

  it('should call onQrCodeDialogOpen and set route when QR Code button is clicked', async () => {
    render(
      <ThemeProvider>
        <MockedProvider>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareDialog open onClose={handleClose} />
          </JourneyProvider>
        </MockedProvider>
      </ThemeProvider>
    )
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'QR Code' }))
    })
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        { query: { param: 'qr-code' } },
        undefined,
        { shallow: true }
      )
    })
  })

  it('should set beacon page viewed on route change', async () => {
    render(<TestShareDialog />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'QR Code' }))
    })
    expect(on).toHaveBeenCalledWith('routeChangeComplete', expect.any(Function))
    const callback = on.mock.calls[0][1]
    callback()
  })

  it('should disable all buttons and prevent clipboard access when journey is undefined', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey: undefined, variant: 'admin' }}>
              <ShareDialog open onClose={handleClose} />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
    })

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
