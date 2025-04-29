import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { render } from '@testing-library/react'
import { User } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'

import { ThemeProvider } from '../../../ThemeProvider'
import { SortOrder } from '../../JourneySort'

import {
  defaultJourney,
  journey,
  journeyWithLongTitle,
  newJourney,
  pendingActionJourney
} from './ActiveJourneyListData'
import { ActivePriorityList } from './ActivePriorityList'
import '../../../../../test/i18n'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const mockedUseMediaQuery = useMediaQuery as jest.Mock

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

  it('should show 4 journey cards per list row on larger screens with md breakpoint', () => {
    const user = { id: 'user1.id' } as unknown as User

    // Note, we need to mock the useMediaQuery hook to test the grid size
    mockedUseMediaQuery.mockImplementation((query) => {
      if (query === '(min-width: 94rem)') return true
      if (query === '(min-width: 78rem)') return false
      if (query === '(min-width: 62rem)') return false
    })

    const journeyList = (
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <ActivePriorityList
              journeys={[
                defaultJourney,
                journey,
                newJourney,
                pendingActionJourney,
                journeyWithLongTitle
              ]}
              refetch={jest.fn()}
              user={user}
            />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    const { container } = render(journeyList)

    // For four columns layout, gridSize should be 3 (MUI Grid uses 12 column system, 12/3 = 4 cards per row)
    const gridItems = container.querySelectorAll('.MuiGrid2-grid-md-3')
    expect(gridItems).toHaveLength(5)
  })

  it('should show 3 journey cards per list row on smaller screens with md breakpoint', () => {
    const user = { id: 'user1.id' } as unknown as User

    // Note, we need to mock the useMediaQuery hook to test the grid size
    mockedUseMediaQuery.mockImplementation((query) => {
      if (query === '(min-width: 94rem)') return false
      if (query === '(min-width: 78rem)') return true
      if (query === '(min-width: 62rem)') return false
    })

    const journeyList = (
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <ActivePriorityList
              journeys={[
                defaultJourney,
                journey,
                newJourney,
                pendingActionJourney,
                journeyWithLongTitle
              ]}
              refetch={jest.fn()}
              user={user}
            />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    const { container } = render(journeyList)

    // For three columns layout, gridSize should be 4
    const gridItems = container.querySelectorAll('.MuiGrid2-grid-md-4')
    expect(gridItems).toHaveLength(5)
  })

  it('should show 2 journey cards per list row on smaller screens with md breakpoint', () => {
    const user = { id: 'user1.id' } as unknown as User

    mockedUseMediaQuery.mockImplementation((query) => {
      if (query === '(min-width: 94rem)') return false // needsFourColumns
      if (query === '(min-width: 78rem)') return false // needsThreeColumns
      if (query === '(min-width: 62rem)') return true // needsTwoColumns
    })

    const journeyList = (
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <ActivePriorityList
              journeys={[
                defaultJourney,
                journey,
                newJourney,
                pendingActionJourney,
                journeyWithLongTitle
              ]}
              refetch={jest.fn()}
              user={user}
            />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    const { container } = render(journeyList)

    // For two columns layout, gridSize should be 6
    const gridItems = container.querySelectorAll('.MuiGrid2-grid-md-6')
    expect(gridItems).toHaveLength(5)
  })

  it('should show 1 journey card per list row on smaller screens with md breakpoint', () => {
    const user = { id: 'user1.id' } as unknown as User

    mockedUseMediaQuery.mockImplementation((query) => {
      if (query === '(min-width: 94rem)') return false // needsFourColumns
      if (query === '(min-width: 78rem)') return false // needsThreeColumns
      if (query === '(min-width: 62rem)') return false // needsTwoColumns
    })

    const journeyList = (
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <ActivePriorityList
              journeys={[
                defaultJourney,
                journey,
                newJourney,
                pendingActionJourney,
                journeyWithLongTitle
              ]}
              refetch={jest.fn()}
              user={user}
            />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    const { container } = render(journeyList)

    // For one columns layout, gridSize should be 12
    const gridItems = container.querySelectorAll('.MuiGrid2-grid-md-12')
    expect(gridItems).toHaveLength(5)
  })
})
