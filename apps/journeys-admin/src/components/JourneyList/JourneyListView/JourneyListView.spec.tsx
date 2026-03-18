import { fireEvent, render } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { useTeam } from '@core/journeys/ui/TeamProvider'

import { ThemeProvider } from '../../ThemeProvider'

import { JourneyListView } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => {
    return {
      query: {
        status: 'active',
        type: 'journeys'
      },
      push: jest.fn()
    }
  })
}))

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key
  }))
}))

jest.mock('@core/journeys/ui/TeamProvider', () => ({
  __esModule: true,
  useTeam: jest.fn(() => ({
    activeTeam: { id: 'teamId', title: 'Test Team' }
  }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockedUseTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>
const mockedUseTeam = useTeam as jest.MockedFunction<typeof useTeam>

const mockRenderList = jest.fn(() => (
  <div data-testid="rendered-list">List</div>
))
const mockSetActiveEvent = jest.fn()
const mockSetSortOrder = jest.fn()

describe('JourneyListView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseTranslation.mockReturnValue({
      t: (key: string) => key,
      i18n: {} as never,
      ready: true
    } as never)
  })

  it('should render tabs with correct labels', () => {
    const { getByRole } = render(
      <ThemeProvider>
        <JourneyListView
          renderList={mockRenderList}
          setActiveEvent={mockSetActiveEvent}
          setSortOrder={mockSetSortOrder}
        />
      </ThemeProvider>
    )

    expect(getByRole('tab', { name: 'Team Projects' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Team Templates' })).toBeInTheDocument()
  })

  it('should render status filter dropdown', () => {
    const { getByLabelText } = render(
      <ThemeProvider>
        <JourneyListView
          renderList={mockRenderList}
          setActiveEvent={mockSetActiveEvent}
          setSortOrder={mockSetSortOrder}
        />
      </ThemeProvider>
    )

    expect(getByLabelText('Filter by status')).toBeInTheDocument()
  })

  it('should render journey list view test id', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <JourneyListView
          renderList={mockRenderList}
          setActiveEvent={mockSetActiveEvent}
          setSortOrder={mockSetSortOrder}
        />
      </ThemeProvider>
    )

    expect(getByTestId('journey-list-view')).toBeInTheDocument()
  })

  it('should call renderList with journeys and active status by default', () => {
    render(
      <ThemeProvider>
        <JourneyListView
          renderList={mockRenderList}
          setActiveEvent={mockSetActiveEvent}
          setSortOrder={mockSetSortOrder}
        />
      </ThemeProvider>
    )

    expect(mockRenderList).toHaveBeenCalledWith('journeys', 'active')
  })

  it('should call renderList with templates when type query param is templates', () => {
    mockedUseRouter.mockReturnValue({
      query: {
        status: 'active',
        type: 'templates'
      },
      push: jest.fn()
    } as unknown as NextRouter)

    render(
      <ThemeProvider>
        <JourneyListView
          renderList={mockRenderList}
          setActiveEvent={mockSetActiveEvent}
          setSortOrder={mockSetSortOrder}
        />
      </ThemeProvider>
    )

    expect(mockRenderList).toHaveBeenCalledWith('templates', 'active')
  })

  it('should call renderList with correct status from query param', () => {
    mockedUseRouter.mockReturnValue({
      query: {
        status: 'archived',
        type: 'journeys'
      },
      push: jest.fn()
    } as unknown as NextRouter)

    render(
      <ThemeProvider>
        <JourneyListView
          renderList={mockRenderList}
          setActiveEvent={mockSetActiveEvent}
          setSortOrder={mockSetSortOrder}
        />
      </ThemeProvider>
    )

    expect(mockRenderList).toHaveBeenCalledWith('journeys', 'archived')
  })

  it('should switch tabs and update router when clicking on templates tab', () => {
    const pushMock = jest.fn()
    mockedUseRouter.mockReturnValue({
      query: {
        status: 'active',
        type: 'journeys'
      },
      push: pushMock
    } as unknown as NextRouter)

    const { getByRole } = render(
      <ThemeProvider>
        <JourneyListView
          renderList={mockRenderList}
          setActiveEvent={mockSetActiveEvent}
          setSortOrder={mockSetSortOrder}
        />
      </ThemeProvider>
    )

    const templatesTab = getByRole('tab', { name: 'Team Templates' })
    fireEvent.click(templatesTab)

    expect(pushMock).toHaveBeenCalledWith(
      {
        query: {
          status: 'active',
          type: 'templates'
        }
      },
      undefined,
      { shallow: true }
    )
    expect(mockSetActiveEvent).toHaveBeenCalledWith('refetchActive')
  })

  it('should change status filter and update router', () => {
    const pushMock = jest.fn()
    mockedUseRouter.mockReturnValue({
      query: {
        status: 'active',
        type: 'journeys'
      },
      push: pushMock
    } as unknown as NextRouter)

    const { getByLabelText, getByRole } = render(
      <ThemeProvider>
        <JourneyListView
          renderList={mockRenderList}
          setActiveEvent={mockSetActiveEvent}
          setSortOrder={mockSetSortOrder}
        />
      </ThemeProvider>
    )

    const statusFilterButton = getByRole('button', { name: 'Filter by status' })
    fireEvent.click(statusFilterButton)
    const archivedOption = getByLabelText('Archived')
    fireEvent.click(archivedOption)

    expect(pushMock).toHaveBeenCalledWith(
      {
        query: {
          status: 'archived',
          type: 'journeys'
        }
      },
      undefined,
      { shallow: true }
    )
    expect(mockSetActiveEvent).toHaveBeenCalledWith('refetchArchived')
  })

  it('should sync with router query params when they change externally', () => {
    const pushMock = jest.fn()
    mockedUseRouter.mockReturnValue({
      query: {
        status: 'trashed',
        type: 'templates'
      },
      push: pushMock
    } as unknown as NextRouter)

    const { rerender } = render(
      <ThemeProvider>
        <JourneyListView
          renderList={mockRenderList}
          setActiveEvent={mockSetActiveEvent}
          setSortOrder={mockSetSortOrder}
        />
      </ThemeProvider>
    )

    expect(mockRenderList).toHaveBeenCalledWith('templates', 'trashed')

    // Simulate router query change
    mockedUseRouter.mockReturnValue({
      query: {
        status: 'archived',
        type: 'journeys'
      },
      push: pushMock
    } as unknown as NextRouter)

    rerender(
      <ThemeProvider>
        <JourneyListView
          renderList={mockRenderList}
          setActiveEvent={mockSetActiveEvent}
          setSortOrder={mockSetSortOrder}
        />
      </ThemeProvider>
    )

    expect(mockRenderList).toHaveBeenCalledWith('journeys', 'archived')
  })

  it('should render TeamMode when activeTeam is not null', () => {
    mockedUseTeam.mockReturnValue({
      activeTeam: { id: 'teamId', title: 'Test Team' }
    } as never)

    const { getByRole, getByTestId } = render(
      <ThemeProvider>
        <JourneyListView
          renderList={mockRenderList}
          setActiveEvent={mockSetActiveEvent}
          setSortOrder={mockSetSortOrder}
        />
      </ThemeProvider>
    )

    expect(getByTestId('journey-list-view')).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Team Projects' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Team Templates' })).toBeInTheDocument()
  })

  it('should render SharedWithMeMode when activeTeam is null', () => {
    mockedUseTeam.mockReturnValue({
      activeTeam: null
    } as never)

    const { queryByRole, getByTestId } = render(
      <ThemeProvider>
        <JourneyListView
          renderList={mockRenderList}
          setActiveEvent={mockSetActiveEvent}
          setSortOrder={mockSetSortOrder}
        />
      </ThemeProvider>
    )

    expect(getByTestId('journey-list-view')).toBeInTheDocument()
    expect(
      queryByRole('tab', { name: 'Team Projects' })
    ).not.toBeInTheDocument()
    expect(
      queryByRole('tab', { name: 'Team Templates' })
    ).not.toBeInTheDocument()
  })
})
