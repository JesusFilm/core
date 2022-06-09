import { render } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { TabLoadingSkeleton } from './TabLoadingSkeleton'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('TabLoadingSekeleton', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  it('should render elements', () => {
    const { getAllByRole, getByRole, getByText } = render(
      <TabLoadingSkeleton />
    )
    expect(getAllByRole('link')).toHaveLength(3)
    expect(getByRole('tablist')).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Active' })).toBeDisabled()
    expect(getByRole('tab', { name: 'Archived' })).toBeDisabled()
    expect(getByRole('tab', { name: 'Deleted' })).toBeDisabled()
    expect(getByText('Sort By')).toBeInTheDocument()
  })
})
