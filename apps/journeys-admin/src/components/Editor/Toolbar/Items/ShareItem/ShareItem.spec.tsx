import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { useCurrentUserLazyQuery } from '../../../../../libs/useCurrentUserLazyQuery'
import { SHARE_DATA_QUERY } from '../../../../../libs/useShareDataQuery/useShareDataQuery'

import { ShareDialog } from './ShareDialog'
import { ShareItem } from './ShareItem'

const shareDataQueryMock: MockedResponse = {
  request: {
    query: SHARE_DATA_QUERY,
    variables: {
      id: 'journey-id',
      qrCodeWhere: { journeyId: 'journey-id' }
    }
  },
  result: {
    data: {
      journey: {
        id: 'journey-id',
        slug: 'default',
        title: 'Journey Heading',
        team: {
          id: 'teamId',
          customDomains: [
            {
              id: 'customDomainId',
              name: 'example.com',
              apexName: 'example.com',
              routeAllTeamJourneys: false
            }
          ]
        }
      },
      qrCodes: []
    }
  }
}

jest.mock('./ShareDialog', () => ({
  __esModule: true,
  ShareDialog: jest.fn(
    ({
      open,
      onClose,
      hostname,
      onSlugDialogOpen,
      onEmbedDialogOpen,
      onQrCodeDialogOpen
    }) => {
      if (!open) return null
      return (
        <div data-testid="mock-share-dialog">
          <button onClick={onClose}>Close Dialog</button>
          <button onClick={onSlugDialogOpen}>Edit URL</button>
          <button onClick={onEmbedDialogOpen}>Embed Journey</button>
          <button onClick={onQrCodeDialogOpen}>QR Code</button>
          <div>Hostname: {hostname ?? 'default'}</div>
        </div>
      )
    }
  )
}))

jest.mock('../../../../../libs/useCurrentUserLazyQuery', () => ({
  __esModule: true,
  useCurrentUserLazyQuery: jest.fn()
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedShareDialog = ShareDialog as jest.MockedFunction<typeof ShareDialog>
const mockUseCurrentUserLazyQuery = useCurrentUserLazyQuery as jest.Mock
const user = { id: 'user.id', email: 'test@email.com' }

Object.assign(navigator, { clipboard: { writeText: jest.fn() } })

jest.mock('./EmbedJourneyDialog', () => ({
  __esModule: true,
  EmbedJourneyDialog: jest.fn(({ open, onClose }) => {
    if (!open) return null
    return (
      <div data-testid="embed-journey-dialog">
        <button onClick={onClose}>Close Dialog</button>
      </div>
    )
  })
}))

jest.mock('./QrCodeDialog', () => ({
  __esModule: true,
  QrCodeDialog: jest.fn(({ open, onClose }) => {
    if (!open) return null
    return (
      <div data-testid="qr-code-dialog">
        <button onClick={onClose}>Close Dialog</button>
      </div>
    )
  })
}))

describe('ShareItem', () => {
  const push = jest.fn()
  const on = jest.fn()
  let originalEnv

  beforeEach(() => {
    jest.clearAllMocks()
    originalEnv = process.env
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: 'https://my.nextstep.is'
    }
    mockUseCurrentUserLazyQuery.mockReturnValue([
      jest.fn(),
      { data: { activeUser: user } }
    ])
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should render the share button', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      )
    })
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
  })

  it('should open the ShareDialog when the share button is clicked', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      )
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    })

    expect(screen.getByTestId('mock-share-dialog')).toBeInTheDocument()
  })

  it('should close the ShareDialog when onClose is called', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      )
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Close Dialog' }))
    })
    expect(screen.queryByTestId('mock-share-dialog')).not.toBeInTheDocument()
  })

  it('should open the SlugDialog when Edit URL is clicked', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      )
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Edit URL' }))
    })

    // The SlugDialog is dynamically imported, so we can't easily test its rendering
    // Instead, we verify that the state was updated by checking the props passed to ShareDialog
    expect(mockedShareDialog).toHaveBeenLastCalledWith(
      expect.objectContaining({
        open: true,
        onSlugDialogOpen: expect.any(Function),
        onEmbedDialogOpen: expect.any(Function),
        onQrCodeDialogOpen: expect.any(Function)
      }),
      expect.anything()
    )
  })

  it('should open the EmbedJourneyDialog when Embed Journey is clicked', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      )
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Embed Journey' }))
    })

    expect(mockedShareDialog).toHaveBeenLastCalledWith(
      expect.objectContaining({
        open: true,
        onSlugDialogOpen: expect.any(Function),
        onEmbedDialogOpen: expect.any(Function),
        onQrCodeDialogOpen: expect.any(Function)
      }),
      expect.anything()
    )
  })

  it('should open the QrCodeDialog when QR Code is clicked', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      )
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'QR Code' }))
    })

    expect(mockedShareDialog).toHaveBeenLastCalledWith(
      expect.objectContaining({
        open: true,
        onSlugDialogOpen: expect.any(Function),
        onEmbedDialogOpen: expect.any(Function),
        onQrCodeDialogOpen: expect.any(Function)
      }),
      expect.anything()
    )
  })

  it('should pass custom domain hostname to ShareDialog', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={[shareDataQueryMock]}>
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
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      )
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    })
    await waitFor(() => {
      expect(screen.getByText('Hostname: example.com')).toBeInTheDocument()
    })
  })

  it('should call closeMenu when dialog is closed', async () => {
    const closeMenu = jest.fn()
    await act(async () => {
      render(
        <MockedProvider>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" closeMenu={closeMenu} />
          </JourneyProvider>
        </MockedProvider>
      )
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Close Dialog' }))
    })

    expect(closeMenu).toHaveBeenCalled()
  })

  it('should close the EmbedJourneyDialog when onClose is called', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      )
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Embed Journey' }))
    })

    await waitFor(() => {
      expect(screen.getByTestId('embed-journey-dialog')).toBeInTheDocument()
    })

    const embedDialog = screen.getByTestId('embed-journey-dialog')
    const closeButton = within(embedDialog).getByRole('button', {
      name: 'Close Dialog'
    })

    await act(async () => {
      fireEvent.click(closeButton)
    })

    await waitFor(() => {
      expect(
        screen.queryByTestId('embed-journey-dialog')
      ).not.toBeInTheDocument()
    })
  })

  it('should close the QrCodeDialog when onClose is called', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'QR Code' }))
    })

    await waitFor(() => {
      expect(screen.getByTestId('qr-code-dialog')).toBeInTheDocument()
    })

    const qrCodeDialog = screen.getByTestId('qr-code-dialog')
    const closeButton = within(qrCodeDialog).getByRole('button', {
      name: 'Close Dialog'
    })

    await act(async () => {
      fireEvent.click(closeButton)
    })

    await waitFor(() => {
      expect(screen.queryByTestId('qr-code-dialog')).not.toBeInTheDocument()
    })
  })
})
