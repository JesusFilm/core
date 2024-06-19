import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { LanguageItem } from './LanguageItem'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('LanguageItem', () => {
  it('should open edit journey language dialog', async () => {
    const push = jest.fn()
    const on = jest.fn()
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    const onClose = jest.fn()
    const { getByRole, queryByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <LanguageItem variant="menu-item" onClose={onClose} />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Language' }))
    await waitFor(() => expect(getByRole('dialog')).toBeInTheDocument())
    expect(queryByRole('menuitem')).not.toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'languages' }
        },
        undefined,
        { shallow: true }
      )
    })
  })
})
