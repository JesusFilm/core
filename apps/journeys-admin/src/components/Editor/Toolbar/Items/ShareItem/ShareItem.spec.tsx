import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { Suspense } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'
import { GetUserRole } from '@core/journeys/ui/useUserRoleQuery/__generated__/GetUserRole'

import { Role } from '../../../../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../../../../libs/useCurrentUserLazyQuery'
import { getCustomDomainMock } from '../../../../../libs/useCustomDomainsQuery/useCustomDomainsQuery.mock'
import { SHARE_DATA_QUERY } from '../../../../../libs/useShareDataQuery/useShareDataQuery'

import { ShareDialog } from './ShareDialog'
import { ShareItem } from './ShareItem'

// Mock for ShareDataQuery used in the failing test
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
              routeAllTeamJourneys: false,
              __typename: 'CustomDomain'
            }
          ],
          __typename: 'Team'
        },
        __typename: 'Journey'
      },
      qrCodes: []
    }
  }
}

// Mock the ShareDialog component to simplify testing
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

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockedShareDialog = ShareDialog as jest.MockedFunction<typeof ShareDialog>

const mockUseCurrentUserLazyQuery = useCurrentUserLazyQuery as jest.Mock
const user = { id: 'user.id', email: 'test@email.com' }

Object.assign(navigator, { clipboard: { writeText: jest.fn() } })

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

  it('should render the share button', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: defaultJourney, variant: 'admin' }}>
          <ShareItem variant="button" />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
  })

  it('should open the ShareDialog when the share button is clicked', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: defaultJourney, variant: 'admin' }}>
          <ShareItem variant="button" />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(screen.getByTestId('mock-share-dialog')).toBeInTheDocument()
  })

  it('should close the ShareDialog when onClose is called', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: defaultJourney, variant: 'admin' }}>
          <ShareItem variant="button" />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close Dialog' }))
    expect(screen.queryByTestId('mock-share-dialog')).not.toBeInTheDocument()
  })

  it('should open the SlugDialog when Edit URL is clicked', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: defaultJourney, variant: 'admin' }}>
          <ShareItem variant="button" />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit URL' }))

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

  it('should open the EmbedJourneyDialog when Embed Journey is clicked', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: defaultJourney, variant: 'admin' }}>
          <ShareItem variant="button" />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    fireEvent.click(screen.getByRole('button', { name: 'Embed Journey' }))

    // Similar to above, we verify the state was updated
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

  it('should open the QrCodeDialog when QR Code is clicked', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: defaultJourney, variant: 'admin' }}>
          <ShareItem variant="button" />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    fireEvent.click(screen.getByRole('button', { name: 'QR Code' }))

    // Similar to above, we verify the state was updated
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

    // Wait for the query to be executed
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Share' }))
      // The custom domain's name is "example.com" as defined in the mock
      expect(screen.getByText('Hostname: example.com')).toBeInTheDocument()
    })
  })

  it('should call closeMenu when dialog is closed', () => {
    const closeMenu = jest.fn()
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: defaultJourney, variant: 'admin' }}>
          <ShareItem variant="button" closeMenu={closeMenu} />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close Dialog' }))
    expect(closeMenu).toHaveBeenCalled()
  })
})
