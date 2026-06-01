import { render } from '@testing-library/react'

import { ThemeProvider } from '../../../../ThemeProvider'

import { SharedWithMeMode } from './SharedWithMeMode'

describe('SharedWithMeMode', () => {
  const mockRenderList = vi.fn(() => (
    <div data-testid="rendered-list">List</div>
  ))
  const mockSetActiveEvent = vi.fn()
  const mockSetSortOrder = vi.fn()
  const mockHandleStatusChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render component with correct test id and call renderList with journeys and selectedStatus', () => {
    const selectedStatus = 'active'

    const { getByTestId } = render(
      <ThemeProvider>
        <SharedWithMeMode
          selectedStatus={selectedStatus}
          handleStatusChange={mockHandleStatusChange}
          sortOrder={undefined}
          setSortOrder={mockSetSortOrder}
          setActiveEvent={mockSetActiveEvent}
          renderList={mockRenderList}
        />
      </ThemeProvider>
    )

    expect(getByTestId('journey-list-view')).toBeInTheDocument()
    expect(mockRenderList).toHaveBeenCalledWith('journeys', selectedStatus)
  })
})
