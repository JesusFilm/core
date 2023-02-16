import { render } from '@testing-library/react'
import { AuthUser } from 'next-firebase-auth'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { SortOrder } from '../../JourneySort'
import { sortJourneys } from '../../JourneySort/utils/sortJourneys'
import { ThemeProvider } from '../../../ThemeProvider'
import {
  defaultJourney,
  newJourney,
  pendingActionJourney,
  journey
} from './ActiveJourneyListData'
import { ActivePriorityList } from './ActivePriorityList'

describe('ActivePriorityList', () => {
  it('should show journeyCard in default priority for owners', () => {
    const authUser = { id: 'user1.id' } as unknown as AuthUser
    const { getAllByLabelText } = render(
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <ActivePriorityList
              journeys={[defaultJourney, newJourney, pendingActionJourney]}
              sortJourneys={sortJourneys}
              refetch={jest.fn()}
              authUser={authUser}
            />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getAllByLabelText('journey-card')[0].textContent).toContain(
      'Pending Action Journey'
    )
    expect(getAllByLabelText('journey-card')[1].textContent).toContain(
      'New Journey'
    )
    expect(getAllByLabelText('journey-card')[2].textContent).toContain(
      'Default Journey'
    )
  })

  it('should order journeyCards by alphabetical order', () => {
    const authUser = { id: 'user1.id' } as unknown as AuthUser
    const { getAllByLabelText } = render(
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <ActivePriorityList
              journeys={[
                defaultJourney,
                journey,
                newJourney,
                pendingActionJourney
              ]}
              sortJourneys={sortJourneys}
              sortOrder={SortOrder.TITLE}
              refetch={jest.fn()}
              authUser={authUser}
            />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getAllByLabelText('journey-card')[0].textContent).toContain(
      'Pending Action Journey'
    )
    expect(getAllByLabelText('journey-card')[1].textContent).toContain(
      'New Journey'
    )
    expect(getAllByLabelText('journey-card')[2].textContent).toContain(
      'A Journey for title sort'
    )
    expect(getAllByLabelText('journey-card')[3].textContent).toContain(
      'Default Journey'
    )
  })
})
