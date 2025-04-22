import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { SHARE_DATA_QUERY } from '../../../../../libs/useShareDataQuery/useShareDataQuery'

import { ShareItem } from './ShareItem'

describe('ShareItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

  it('should open and close the ShareDialog', async () => {
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

    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(screen.getByText('Share This Journey')).toBeInTheDocument()

    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape'
    })
    await waitFor(() => {
      expect(screen.queryByText('Share This Journey')).not.toBeInTheDocument()
    })
  })

  it('should call closeMenu when dialog is closed', async () => {
    const closeMenu = jest.fn()
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: defaultJourney, variant: 'admin' }}>
          <ShareItem variant="button" closeMenu={closeMenu} />
        </JourneyProvider>
      </MockedProvider>
    )
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    })
    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape'
    })
    expect(closeMenu).toHaveBeenCalled()
  })
})
