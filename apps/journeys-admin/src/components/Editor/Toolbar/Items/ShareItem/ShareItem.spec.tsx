import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { getCustomDomainMock } from '../../../../../libs/useCustomDomainsQuery/useCustomDomainsQuery.mock'

import { ShareItem } from './ShareItem'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
})

describe('ShareItem', () => {
  const push = jest.fn()
  const on = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('should handle edit journey slug', async () => {
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
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Share' }))
    expect(getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Edit URL' }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'edit-url' }
        },
        undefined,
        { shallow: true }
      )
    })

    expect(getByRole('dialog', { name: 'Edit URL' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(getByRole('button', { name: 'Edit URL' })).toBeInTheDocument()
    })
    expect(getByRole('button', { name: 'Embed Journey' })).toBeInTheDocument()
  })

  it('should handle embed journey', async () => {
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
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Share' }))
    expect(getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Embed Journey' }))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'embed-journey' }
        },
        undefined,
        { shallow: true }
      )
    })

    expect(getByRole('dialog', { name: 'Embed journey' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Copy Code' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(getByRole('button', { name: 'Edit URL' })).toBeInTheDocument()
    })
    expect(getByRole('button', { name: 'Embed Journey' })).toBeInTheDocument()
  })

  it('should copy journey link', async () => {
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
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Share' }))
    fireEvent.click(getByRole('button', { name: 'Copy' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://your.nextstep.is/default'
    )
  })

  it('should copy journey link with custom domain', async () => {
    const result = jest.fn().mockReturnValue(getCustomDomainMock.result)
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)
    const { getByRole } = render(
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
    fireEvent.click(getByRole('button', { name: 'Share' }))
    fireEvent.click(getByRole('button', { name: 'Copy' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://example.com/default'
    )
  })
})
