import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { GetCustomDomains } from '../../../../../__generated__/GetCustomDomains'
import { CustomDomainProvider } from '../../../CustomDomainProvider'
import { defaultJourney } from '../../data'

import { JourneyLink } from './JourneyLink'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('JourneyLink', () => {
  const push = jest.fn()
  const on = jest.fn()

  const journeyWithTeam = { ...defaultJourney, team: { id: 'teamId' } }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should handle edit journey slug', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    const { getAllByRole, getByRole, queryByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <JourneyLink />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getAllByRole('button', { name: 'Edit URL' })[0])
    expect(getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'edit-url' },
          push,
          events: {
            on
          }
        },
        undefined,
        { shallow: true }
      )
    })
  })

  it('should handle embed journey', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)
    const { getAllByRole, getByRole, queryByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <JourneyLink />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getAllByRole('button', { name: 'Embed Journey' })[0])
    expect(getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'embed-journey' },
          push,
          events: {
            on
          }
        },
        undefined,
        { shallow: true }
      )
    })
  })

  it('should show custom domain if it exists', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <CustomDomainProvider
            value={{
              customDomains: {
                customDomains: [
                  {
                    __typename: 'CustomDomain' as const,
                    name: 'mockdomain.com',
                    apexName: 'mockdomain.com',
                    id: 'customDomainId',
                    verification: {
                      __typename: 'CustomDomainVerification' as const,
                      verified: true,
                      verification: []
                    }
                  }
                ]
              } as unknown as GetCustomDomains
            }}
          >
            <JourneyProvider
              value={{
                journey: journeyWithTeam as JourneyFields,
                variant: 'admin'
              }}
            >
              <JourneyLink />
            </JourneyProvider>
          </CustomDomainProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(getByRole('textbox')).toHaveValue('https://mockdomain.com/default')
  })
})
