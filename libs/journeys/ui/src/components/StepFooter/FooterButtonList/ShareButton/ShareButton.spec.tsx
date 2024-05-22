import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '../../../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'
import { getCustomDomainMock } from '../../../../libs/useCustomDomainsQuery/useCustomDomainsQuery.mock'

import { ShareButton } from './ShareButton'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('ShareButton', () => {
  const originalNavigator = { ...global.navigator }

  beforeEach(() => {
    Object.assign(navigator, { ...originalNavigator, share: undefined })
  })

  afterEach(() => {
    jest.resetAllMocks()
    Object.assign(navigator, originalNavigator)
  })

  it('should open native share dialog on mobile', () => {
    const navigatorMock = jest.fn()

    Object.assign(navigator, {
      share: navigatorMock
    })

    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { slug: 'test-slug' } as unknown as Journey
            }}
          >
            <ShareButton />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(navigatorMock).toHaveBeenCalled()
  })

  it('should open share dialog on desktop', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { slug: 'test-slug' } as unknown as Journey
            }}
          >
            <ShareButton />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(getByRole('dialog', { name: 'Share' })).toBeInTheDocument()
  })

  it('should disable click on admin', () => {
    const { getByRole, queryByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { slug: 'test-slug' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <ShareButton />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(queryByRole('dialog', { name: 'Share' })).not.toBeInTheDocument()
  })

  it('should get custom domain if there is one', async () => {
    const result = jest.fn().mockReturnValue(getCustomDomainMock.result)

    render(
      <MockedProvider mocks={[{ ...getCustomDomainMock, result }]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                slug: 'test-slug',
                team: { id: 'teamId' }
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <ShareButton />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
