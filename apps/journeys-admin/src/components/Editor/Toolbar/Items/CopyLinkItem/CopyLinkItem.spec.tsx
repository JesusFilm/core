import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { getCustomDomainMock } from '../../../../../libs/useCustomDomainsQuery/useCustomDomainsQuery.mock'

import { CopyLinkItem } from './CopyLinkItem'

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
})

describe('CopyLinkItem', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
  })

  it('should copy url in development', async () => {
    const onClose = jest.fn()
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: 'http://localhost:4100'
    }

    jest.spyOn(navigator.clipboard, 'writeText')

    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <CopyLinkItem variant="menu-item" onClose={onClose} />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Copy Link' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_JOURNEYS_URL as string}/${defaultJourney.slug}`
    )
    await waitFor(() => {
      expect(getByText('Link Copied')).toBeInTheDocument()
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('should copy url in production', async () => {
    const onClose = jest.fn()
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: undefined
    }

    jest.spyOn(navigator.clipboard, 'writeText')

    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <CopyLinkItem variant="menu-item" onClose={onClose} />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Copy Link' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `https://your.nextstep.is/${defaultJourney.slug}`
    )
    await waitFor(() => {
      expect(getByText('Link Copied')).toBeInTheDocument()
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('should copy url in production with custom domain', async () => {
    const result = jest.fn().mockReturnValue(getCustomDomainMock.result)
    const onClose = jest.fn()
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: undefined
    }

    jest.spyOn(navigator.clipboard, 'writeText')

    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[{ ...getCustomDomainMock, result }]}>
          <TeamProvider>
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
              <CopyLinkItem variant="menu-item" onClose={onClose} />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('menuitem', { name: 'Copy Link' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `https://example.com/${defaultJourney.slug}`
    )
    await waitFor(() => {
      expect(getByText('Link Copied')).toBeInTheDocument()
    })
    expect(onClose).toHaveBeenCalled()
  })
})
