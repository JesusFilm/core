import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { TeamProvider } from '../../../../Team/TeamProvider'
import { defaultJourney } from '../../../data'

import { LanguageMenuItem } from './LanguageMenuItem'

describe('LanguageMenuItem', () => {
  it('should open edit journey language dialog', async () => {
    const onClose = jest.fn()
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <LanguageMenuItem onClose={onClose} />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Language' }))
    await waitFor(() => expect(getByRole('dialog')).toBeInTheDocument())
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })
})
