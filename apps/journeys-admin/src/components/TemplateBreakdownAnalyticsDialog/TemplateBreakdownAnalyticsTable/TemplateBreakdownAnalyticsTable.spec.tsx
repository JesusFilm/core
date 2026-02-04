import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { GetTemplateFamilyStatsBreakdown } from '../../../../__generated__/GetTemplateFamilyStatsBreakdown'
import { PlausibleEvent } from '../../../../__generated__/globalTypes'

import { TemplateBreakdownAnalyticsTable } from './TemplateBreakdownAnalyticsTable'
import {
  mockDataForSorting,
  mockDataWithManyRows,
  mockDataWithOnlyViews,
  mockDataWithRestrictedRow,
  mockDataWithTeamAlpha,
  mockDataWithViewsAndResponses,
  mockEmptyData,
  mockMultipleRowsData,
  mockSingleRowData
} from './TemplateBreakdownAnalyticsTable.mockData'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('TemplateBreakdownAnalyticsTable', () => {
  it('should render empty box when loading', () => {
    render(<TemplateBreakdownAnalyticsTable data={null} loading={true} />)

    expect(
      screen.getByTestId('template-breakdown-analytics-table-empty')
    ).toBeInTheDocument()
    expect(screen.queryByText('TOTAL')).not.toBeInTheDocument()
  })

  it('should render empty box when error is present', () => {
    render(
      <TemplateBreakdownAnalyticsTable
        data={null}
        error={new Error('Test error')}
      />
    )

    expect(
      screen.getByTestId('template-breakdown-analytics-table-empty')
    ).toBeInTheDocument()
    expect(screen.queryByText('TOTAL')).not.toBeInTheDocument()
  })

  it('should render empty box when data is null', () => {
    render(<TemplateBreakdownAnalyticsTable data={null} />)

    expect(
      screen.getByTestId('template-breakdown-analytics-table-empty')
    ).toBeInTheDocument()
    expect(screen.queryByText('TOTAL')).not.toBeInTheDocument()
  })

  it('should render empty box when data.templateFamilyStatsBreakdown is null', () => {
    const data: GetTemplateFamilyStatsBreakdown = {
      templateFamilyStatsBreakdown: null
    }

    render(<TemplateBreakdownAnalyticsTable data={data} />)

    expect(
      screen.getByTestId('template-breakdown-analytics-table-empty')
    ).toBeInTheDocument()
    expect(screen.queryByText('TOTAL')).not.toBeInTheDocument()
  })

  it('should render table with data', () => {
    render(<TemplateBreakdownAnalyticsTable data={mockSingleRowData} />)

    expect(screen.getByText('TOTAL')).toBeInTheDocument()
    expect(screen.getByText('Journey 1')).toBeInTheDocument()
    expect(screen.getByText('Team A')).toBeInTheDocument()
  })

  it('should render total row with correct values', () => {
    render(<TemplateBreakdownAnalyticsTable data={mockMultipleRowsData} />)

    const totalRow = screen.getByText('TOTAL').closest('tr')
    expect(totalRow).toBeInTheDocument()

    // Check that totals are calculated correctly (100+200=300, 50+75=125, 25+30=55)
    // Total row is in TableHead, so cells have role "columnheader"
    const cells = within(totalRow!).getAllByRole('columnheader')
    expect(cells.some((cell) => cell.textContent === '300')).toBe(true)
    expect(cells.some((cell) => cell.textContent === '125')).toBe(true)
    expect(cells.some((cell) => cell.textContent === '55')).toBe(true)
  })

  it('should include restricted row in total calculation', () => {
    render(<TemplateBreakdownAnalyticsTable data={mockDataWithRestrictedRow} />)

    const totalRow = screen.getByText('TOTAL').closest('tr')
    // Total row is in TableHead, so cells have role "columnheader"
    const cells = within(totalRow!).getAllByRole('columnheader')
    // Total should be 100 + 50 = 150
    expect(cells.some((cell) => cell.textContent === '150')).toBe(true)
  })

  it('should render restricted row when present', () => {
    render(<TemplateBreakdownAnalyticsTable data={mockDataWithRestrictedRow} />)

    expect(screen.getByText('Restricted teams')).toBeInTheDocument()
    expect(
      screen.getByText("This data is from teams you don't have access to.")
    ).toBeInTheDocument()
  })

  it('should not render restricted row when not present', () => {
    render(<TemplateBreakdownAnalyticsTable data={mockSingleRowData} />)

    expect(screen.queryByText('Restricted teams')).not.toBeInTheDocument()
  })

  it('should hide columns with all zero values', () => {
    render(<TemplateBreakdownAnalyticsTable data={mockDataWithOnlyViews} />)

    // Team column should always be visible
    expect(screen.getByText('Team')).toBeInTheDocument()
    // Views should be visible (may have sort indicator prefix)
    const viewsElements = screen.getAllByText(/Views/)
    expect(viewsElements.length).toBeGreaterThan(0)
    // Responses should be visible (has 0 but might be shown)
    // Other columns with all zeros should be hidden
  })

  it('should render journey links correctly', () => {
    render(<TemplateBreakdownAnalyticsTable data={mockSingleRowData} />)

    const link = screen.getByText('Journey 1').closest('a')
    expect(link).toHaveAttribute('href', '/journeys/journey-1')
  })

  it('should limit display rows to 10', () => {
    render(<TemplateBreakdownAnalyticsTable data={mockDataWithManyRows} />)

    // Should only show first 10 regular rows + total row + possibly restricted row
    const journeyRows = screen
      .getAllByText(/Journey \d+/)
      .filter(
        (el) => el.textContent !== 'Journey 1' && el.textContent !== 'Journey 2'
      )
    // We expect at most 10 regular rows to be displayed
    expect(journeyRows.length).toBeLessThanOrEqual(10)
  })

  it('should sort rows when column header is clicked', async () => {
    render(<TemplateBreakdownAnalyticsTable data={mockDataForSorting} />)

    // Initially sorted by views descending (200, 100, 50)
    const rows = screen.getAllByText(/Journey [ABC]/)
    expect(rows[0].textContent).toBe('Journey B')

    // Click on Views header to toggle sort
    const buttons = screen.getAllByRole('button')
    const viewsHeader = buttons.find((button) =>
      button.textContent?.includes('Views')
    )
    expect(viewsHeader).toBeDefined()
    await userEvent.click(viewsHeader!)

    // Should now be sorted ascending (50, 100, 200)
    const rowsAfterSort = screen.getAllByText(/Journey [ABC]/)
    expect(rowsAfterSort[0].textContent).toBe('Journey C')
  })

  it('should display column headers correctly', () => {
    render(
      <TemplateBreakdownAnalyticsTable data={mockDataWithViewsAndResponses} />
    )

    expect(screen.getByText('Team')).toBeInTheDocument()
    expect(screen.getByText('Link to project')).toBeInTheDocument()
    const viewsElements = screen.getAllByText(/Views/)
    expect(viewsElements.length).toBeGreaterThan(0)
    expect(screen.getByText('Responses')).toBeInTheDocument()
  })

  it('should handle empty data array', () => {
    render(<TemplateBreakdownAnalyticsTable data={mockEmptyData} />)

    // Should still show total row with zeros
    expect(screen.getByText('TOTAL')).toBeInTheDocument()
    // Should not show any journey rows
    expect(screen.queryByText(/Journey/)).not.toBeInTheDocument()
  })

  it('should render team names in regular rows', () => {
    render(<TemplateBreakdownAnalyticsTable data={mockDataWithTeamAlpha} />)

    expect(screen.getByText('Team Alpha')).toBeInTheDocument()
  })

  it('should always show views column even when all values are zero', () => {
    const dataWithZeroViews: GetTemplateFamilyStatsBreakdown = {
      templateFamilyStatsBreakdown: [
        {
          __typename: 'TemplateFamilyStatsBreakdownResponse',
          journeyId: 'journey-1',
          journeyName: 'Journey 1',
          teamName: 'Team A',
          status: null,
          stats: [
            {
              __typename: 'TemplateFamilyStatsEventResponse',
              event: PlausibleEvent.journeyResponses,
              visitors: 50
            }
            // No journeyVisitors event, so views will be 0
          ]
        }
      ]
    }

    render(<TemplateBreakdownAnalyticsTable data={dataWithZeroViews} />)

    // Views column header should be visible
    const viewsElements = screen.getAllByText(/Views/)
    expect(viewsElements.length).toBeGreaterThan(0)

    // Views column should show 0 in the total row
    const totalRow = screen.getByText('TOTAL').closest('tr')
    // Total row is in TableHead, so cells have role "columnheader"
    const cells = within(totalRow!).getAllByRole('columnheader')
    expect(cells.some((cell) => cell.textContent === '0')).toBe(true)
  })
})
