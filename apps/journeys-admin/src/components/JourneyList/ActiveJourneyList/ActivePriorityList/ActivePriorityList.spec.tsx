import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { User } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'

import { ThemeProvider } from '../../../ThemeProvider'
import { SortOrder } from '../../JourneySort'

import {
  defaultJourney,
  journey,
  newJourney,
  pendingActionJourney
} from './ActiveJourneyListData'
import { ActivePriorityList } from './ActivePriorityList'
import '../../../../../test/i18n'

describe('ActivePriorityList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show journeyCard in default priority for owners', () => {
    const user = { id: 'user1.id' } as unknown as User
    const { getAllByLabelText } = render(
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <ActivePriorityList
              journeys={[defaultJourney, newJourney, pendingActionJourney]}
              refetch={jest.fn()}
              user={user}
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
    const user = { id: 'user1.id' } as unknown as User
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
              sortOrder={SortOrder.TITLE}
              refetch={jest.fn()}
              user={user}
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
