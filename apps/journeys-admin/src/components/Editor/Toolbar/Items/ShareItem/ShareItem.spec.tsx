import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { defaultJourney } from '../../../data'

import { ShareItem } from './ShareItem'

import '../../../../../../test/i18n'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('ShareItem', () => {
  const push = jest.fn()
  const on = jest.fn()

  it('should handle edit journey slug', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    const { getByRole, getAllByText } = render(
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

    await waitFor(() => {
      expect(getAllByText('Edit URL')).toHaveLength(2) // button on ShareItem, and title on the SlugDialog
    })
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
    const { getByRole, getByText } = render(
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
    await waitFor(() => {
      expect(getByText('Embed journey')).toBeInTheDocument() // EmbedJourneyDialog title
    })
    expect(getByRole('button', { name: 'Copy Code' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(getByRole('button', { name: 'Edit URL' })).toBeInTheDocument()
    })
    expect(getByRole('button', { name: 'Embed Journey' })).toBeInTheDocument()
  })
})
