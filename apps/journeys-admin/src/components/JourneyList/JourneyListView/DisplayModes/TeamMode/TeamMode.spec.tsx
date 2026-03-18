import { render } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { ThemeProvider } from '../../../../ThemeProvider'

import { TeamMode } from './TeamMode'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('TeamMode', () => {
  const mockRenderList = jest.fn(() => (
    <div data-testid="rendered-list">List</div>
  ))
  const mockSetActiveEvent = jest.fn()
  const mockSetSortOrder = jest.fn()
  const mockHandleStatusChange = jest.fn()
  const mockHandleContentTypeChange = jest.fn()

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
    jest.clearAllMocks()
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
})
