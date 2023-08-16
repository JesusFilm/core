import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { defaultJourney } from '../../../../JourneyView/data'
import { TeamProvider } from '../../../../Team/TeamProvider'

import { TitleDescriptionMenuItem } from './TitleDescriptionMenuItem'

describe('TitleDescriptionMenuItem', () => {
  it('should open edit journey title and description dialog', async () => {
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
              <TitleDescriptionMenuItem onClose={onClose} />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Description' }))
    expect(getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })
})
