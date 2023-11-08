import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { defaultJourney } from '../../../../JourneyView/data'
import { TeamProvider } from '../../../../Team/TeamProvider'

import { CopyMenuItem } from './CopyMenuItem'

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
})

describe('CopyMenuItem', () => {
  const originalEnv = process.env

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
              <CopyMenuItem journey={defaultJourney} onClose={onClose} />
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
    process.env = originalEnv
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
              <CopyMenuItem journey={defaultJourney} onClose={onClose} />
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

    process.env = originalEnv
  })
})
