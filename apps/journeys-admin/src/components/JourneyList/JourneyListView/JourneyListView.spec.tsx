import { fireEvent, render } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { type MockedFunction } from 'vitest'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { ThemeProvider } from '../../ThemeProvider'

import { JourneyListView } from '.'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn(() => {
    return {
      query: {
        status: 'active',
        type: 'journeys'
      },
      push: vi.fn()
    }
  })
}))

vi.mock('next-i18next/pages', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => key
  }))
}))

vi.mock('../../CampaignList', () => ({
  CampaignList: () => <div data-testid="CampaignList" />
}))

vi.mock('@core/journeys/ui/TeamProvider', () => ({
  __esModule: true,
  useTeam: vi.fn(() => ({
    activeTeam: { id: 'teamId', title: 'Test Team' }
  }))
}))

const mockedUseRouter = useRouter as MockedFunction<typeof useRouter>
const mockedUseTranslation = vi.mocked(useTranslation)
const mockedUseTeam = useTeam as MockedFunction<typeof useTeam>

const mockRenderList = vi.fn(() => <div data-testid="rendered-list">List</div>)
const mockSetActiveEvent = vi.fn()
const mockSetSortOrder = vi.fn()

describe('JourneyListView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
      push: vi.fn()
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
      push: vi.fn()
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
    const pushMock = vi.fn()
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
    const pushMock = vi.fn()
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
    const pushMock = vi.fn()
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

  describe('Team Campaigns tab', () => {
    function renderView(campaignBuilder: boolean): ReturnType<typeof render> {
      return render(
        <FlagsProvider flags={{ campaignBuilder }}>
          <ThemeProvider>
            <JourneyListView
              renderList={mockRenderList}
              setActiveEvent={mockSetActiveEvent}
              setSortOrder={mockSetSortOrder}
            />
          </ThemeProvider>
        </FlagsProvider>
      )
    }

    beforeEach(() => {
      mockedUseTeam.mockReturnValue({
        activeTeam: { id: 'teamId', title: 'Test Team' }
      } as never)
    })

    it('should show the Team Campaigns tab after Team Templates when the campaignBuilder flag is on', () => {
      mockedUseRouter.mockReturnValue({
        query: { status: 'active', type: 'journeys' },
        push: vi.fn()
      } as unknown as NextRouter)

      const { getAllByRole } = renderView(true)

      expect(getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
        'Team Projects',
        'Team Templates',
        'Team Campaigns'
      ])
    })

    it('should hide the Team Campaigns tab when the campaignBuilder flag is off', () => {
      mockedUseRouter.mockReturnValue({
        query: { status: 'active', type: 'journeys' },
        push: vi.fn()
      } as unknown as NextRouter)

      const { queryByRole } = renderView(false)

      expect(
        queryByRole('tab', { name: 'Team Campaigns' })
      ).not.toBeInTheDocument()
    })

    it('should hide the Team Campaigns tab in Shared With Me mode', () => {
      mockedUseTeam.mockReturnValue({ activeTeam: null } as never)
      mockedUseRouter.mockReturnValue({
        query: { status: 'active', type: 'journeys' },
        push: vi.fn()
      } as unknown as NextRouter)

      const { queryByRole } = renderView(true)

      expect(
        queryByRole('tab', { name: 'Team Campaigns' })
      ).not.toBeInTheDocument()
    })

    it('should set type=campaigns without a journey refetch when selected', () => {
      const pushMock = vi.fn()
      mockedUseRouter.mockReturnValue({
        query: { status: 'active', type: 'journeys' },
        push: pushMock
      } as unknown as NextRouter)

      const { getByRole } = renderView(true)
      fireEvent.click(getByRole('tab', { name: 'Team Campaigns' }))

      expect(pushMock).toHaveBeenCalledWith(
        { query: { status: 'active', type: 'campaigns' } },
        undefined,
        { shallow: true }
      )
      expect(mockSetActiveEvent).not.toHaveBeenCalled()
    })

    it('should render the campaign list without the status filter or sort on type=campaigns', () => {
      mockedUseRouter.mockReturnValue({
        query: { type: 'campaigns' },
        push: vi.fn()
      } as unknown as NextRouter)

      const { getByRole, getByTestId, queryByLabelText } = renderView(true)

      expect(getByRole('tab', { name: 'Team Campaigns' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
      expect(getByTestId('CampaignList')).toBeInTheDocument()
      expect(queryByLabelText('Filter by status')).not.toBeInTheDocument()
      expect(queryByLabelText('Sort By')).not.toBeInTheDocument()
      expect(queryByLabelText('Journey list actions')).not.toBeInTheDocument()
    })

    it('should send type=campaigns back to journeys when the campaignBuilder flag is off', () => {
      const pushMock = vi.fn()
      mockedUseRouter.mockReturnValue({
        query: { type: 'campaigns' },
        push: pushMock
      } as unknown as NextRouter)

      renderView(false)

      expect(pushMock).toHaveBeenCalledWith(
        { query: { type: 'journeys' } },
        undefined,
        { shallow: true }
      )
    })
  })
})
