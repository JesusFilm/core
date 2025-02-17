import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { Suspense } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'
import { GetUserRole } from '@core/journeys/ui/useUserRoleQuery/__generated__/GetUserRole'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { Role } from '../../../../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../../../../libs/useCurrentUserLazyQuery'
import { getCustomDomainMock } from '../../../../../libs/useCustomDomainsQuery/useCustomDomainsQuery.mock'

import { ShareItem } from './ShareItem'

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
      NEXT_PUBLIC_JOURNEYS_URL: 'https://my.custom.domain'
    }
    mockUseCurrentUserLazyQuery.mockReturnValue({
      loadUser: jest.fn(),
      data: user
    })
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should handle edit journey slug', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: { on }
    } as unknown as NextRouter)

    render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Edit URL' }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        { query: { param: 'edit-url' } },
        undefined,
        { shallow: true }
      )
    })

    expect(screen.getByRole('dialog', { name: 'Edit URL' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Edit URL' })
      ).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: 'Embed Journey' })
    ).toBeInTheDocument()
  })

  it('should handle embed journey', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: { on }
    } as unknown as NextRouter)
    render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Embed Journey' }))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        { query: { param: 'embed-journey' } },
        undefined,
        { shallow: true }
      )
    })

    expect(
      screen.getByRole('dialog', { name: 'Embed journey' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Copy Code' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Edit URL' })
      ).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: 'Embed Journey' })
    ).toBeInTheDocument()
  })

  it('should handle qr code', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: { on }
    } as unknown as NextRouter)

    const getUserRoleMock: MockedResponse<GetUserRole> = {
      request: { query: GET_USER_ROLE },
      result: jest.fn(() => ({
        data: {
          getUserRole: {
            __typename: 'UserRole',
            id: 'user.id',
            roles: [Role.publisher]
          }
        }
      }))
    }

    render(
      <FlagsProvider flags={{ qrCode: true }}>
        <SnackbarProvider>
          <MockedProvider mocks={[getUserRoleMock]}>
            <Suspense>
              <JourneyProvider
                value={{ journey: defaultJourney, variant: 'admin' }}
              >
                <ShareItem variant="button" />
              </JourneyProvider>
            </Suspense>
          </MockedProvider>
        </SnackbarProvider>
      </FlagsProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'QR Code' }))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        { query: { param: 'qr-code' } },
        undefined,
        { shallow: true }
      )
    })

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'QR Code'
      )
    )
    fireEvent.click(screen.getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'QR Code' })
      ).toBeInTheDocument()
    )
  })

  it('should copy journey link', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: { on }
    } as unknown as NextRouter)
    render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://my.custom.domain/default'
    )
  })

  it('should copy journey link with custom domain', async () => {
    const result = jest.fn().mockReturnValue(getCustomDomainMock.result)
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: { on }
    } as unknown as NextRouter)
    render(
      <SnackbarProvider>
        <MockedProvider mocks={[{ ...getCustomDomainMock, result }]}>
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
      </SnackbarProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://example.com/default'
    )
  })
})
