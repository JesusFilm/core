import { render } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { type MockedFunction } from 'vitest'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { ThemeProvider } from '../../../../ThemeProvider'

import { TeamMode } from './TeamMode'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

const mockedUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('TeamMode', () => {
  const mockRenderList = vi.fn(() => (
    <div data-testid="rendered-list">List</div>
  ))
  const mockSetActiveEvent = vi.fn()
  const mockSetSortOrder = vi.fn()
  const mockHandleStatusChange = vi.fn()
  const mockHandleContentTypeChange = vi.fn()

  const contentTypeOptions = [
    {
      queryParam: 'journeys' as const,
      displayValue: 'Team Projects',
      tabIndex: 0
    },
    {
      queryParam: 'templates' as const,
      displayValue: 'Team Templates',
      tabIndex: 1
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render component with correct test id and tabs with correct labels', () => {
    const { getByTestId, getByRole } = render(
      <ThemeProvider>
        <TeamMode
          activeContentTypeTab={0}
          handleContentTypeChange={mockHandleContentTypeChange}
          contentTypeOptions={contentTypeOptions}
          selectedStatus="active"
          handleStatusChange={mockHandleStatusChange}
          sortOrder={undefined}
          setSortOrder={mockSetSortOrder}
          setActiveEvent={mockSetActiveEvent}
          router={mockedUseRouter()}
          renderList={mockRenderList}
        />
      </ThemeProvider>
    )

    expect(getByTestId('journey-list-view')).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Team Projects' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Team Templates' })).toBeInTheDocument()
  })

  it('should call renderList with journeys and selectedStatus', () => {
    const selectedStatus = 'active'
    const routerMock = {
      query: {
        type: 'journeys'
      }
    } as unknown as NextRouter
    mockedUseRouter.mockReturnValue(routerMock)

    const { getByRole } = render(
      <ThemeProvider>
        <TeamMode
          activeContentTypeTab={0}
          handleContentTypeChange={mockHandleContentTypeChange}
          contentTypeOptions={contentTypeOptions}
          selectedStatus={selectedStatus}
          handleStatusChange={mockHandleStatusChange}
          sortOrder={undefined}
          setSortOrder={mockSetSortOrder}
          setActiveEvent={mockSetActiveEvent}
          router={routerMock}
          renderList={mockRenderList}
        />
      </ThemeProvider>
    )

    // Verify journeys tab is active
    expect(getByRole('tab', { name: 'Team Projects' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(getByRole('tab', { name: 'Team Templates' })).toHaveAttribute(
      'aria-selected',
      'false'
    )
    expect(mockRenderList).toHaveBeenCalledWith('journeys', selectedStatus)
  })

  it('should call renderList with templates and selectedStatus', () => {
    const selectedStatus = 'active'
    const routerMock = {
      query: {
        type: 'templates'
      }
    } as unknown as NextRouter
    mockedUseRouter.mockReturnValue(routerMock)

    const { getByRole } = render(
      <ThemeProvider>
        <TeamMode
          activeContentTypeTab={1}
          handleContentTypeChange={mockHandleContentTypeChange}
          contentTypeOptions={contentTypeOptions}
          selectedStatus={selectedStatus}
          handleStatusChange={mockHandleStatusChange}
          sortOrder={undefined}
          setSortOrder={mockSetSortOrder}
          setActiveEvent={mockSetActiveEvent}
          router={routerMock}
          renderList={mockRenderList}
        />
      </ThemeProvider>
    )

    // Verify templates tab is active
    expect(getByRole('tab', { name: 'Team Templates' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(getByRole('tab', { name: 'Team Projects' })).toHaveAttribute(
      'aria-selected',
      'false'
    )
    expect(mockRenderList).toHaveBeenCalledWith('templates', selectedStatus)
  })

  it('should show Sort and bulk-actions menu on Team Templates when teamTemplateCollection is off', () => {
    const routerMock = {
      query: { type: 'templates' }
    } as unknown as NextRouter
    mockedUseRouter.mockReturnValue(routerMock)

    const { getByRole } = render(
      <ThemeProvider>
        <TeamMode
          activeContentTypeTab={1}
          handleContentTypeChange={mockHandleContentTypeChange}
          contentTypeOptions={contentTypeOptions}
          selectedStatus="active"
          handleStatusChange={mockHandleStatusChange}
          sortOrder={undefined}
          setSortOrder={mockSetSortOrder}
          setActiveEvent={mockSetActiveEvent}
          router={routerMock}
          renderList={mockRenderList}
        />
      </ThemeProvider>
    )

    expect(getByRole('button', { name: 'Sort By' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Journey list actions' })
    ).toBeInTheDocument()
  })

  it('should hide Sort and bulk-actions menu on Team Templates when teamTemplateCollection is on (NES-1872)', () => {
    const routerMock = {
      query: { type: 'templates' }
    } as unknown as NextRouter
    mockedUseRouter.mockReturnValue(routerMock)

    const { queryByRole } = render(
      <FlagsProvider flags={{ teamTemplateCollection: true }}>
        <ThemeProvider>
          <TeamMode
            activeContentTypeTab={1}
            handleContentTypeChange={mockHandleContentTypeChange}
            contentTypeOptions={contentTypeOptions}
            selectedStatus="active"
            handleStatusChange={mockHandleStatusChange}
            sortOrder={undefined}
            setSortOrder={mockSetSortOrder}
            setActiveEvent={mockSetActiveEvent}
            router={routerMock}
            renderList={mockRenderList}
          />
        </ThemeProvider>
      </FlagsProvider>
    )

    expect(queryByRole('button', { name: 'Sort By' })).not.toBeInTheDocument()
    expect(
      queryByRole('button', { name: 'Journey list actions' })
    ).not.toBeInTheDocument()
  })

  it('should still show Sort and bulk-actions menu on Team Projects when teamTemplateCollection is on', () => {
    const routerMock = {
      query: { type: 'journeys' }
    } as unknown as NextRouter
    mockedUseRouter.mockReturnValue(routerMock)

    const { getByRole } = render(
      <FlagsProvider flags={{ teamTemplateCollection: true }}>
        <ThemeProvider>
          <TeamMode
            activeContentTypeTab={0}
            handleContentTypeChange={mockHandleContentTypeChange}
            contentTypeOptions={contentTypeOptions}
            selectedStatus="active"
            handleStatusChange={mockHandleStatusChange}
            sortOrder={undefined}
            setSortOrder={mockSetSortOrder}
            setActiveEvent={mockSetActiveEvent}
            router={routerMock}
            renderList={mockRenderList}
          />
        </ThemeProvider>
      </FlagsProvider>
    )

    expect(getByRole('button', { name: 'Sort By' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Journey list actions' })
    ).toBeInTheDocument()
  })
})
