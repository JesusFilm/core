import { NUMERIC_COLUMNS } from '../constants'
import { ProcessedRow, SortableColumn } from '../types'

import { trackNonZeroColumns } from './trackNonZeroColumns'

describe('trackNonZeroColumns', () => {
  const createMockProcessedRow = (
    overrides: Partial<ProcessedRow> = {}
  ): ProcessedRow => ({
    __typename: 'TemplateFamilyStatsBreakdownResponse',
    journeyId: 'journey-1',
    journeyName: 'Test Journey',
    teamName: 'Test Team',
    status: null,
    stats: [],
    views: 0,
    responses: 0,
    christDecisionCapture: 0,
    prayerRequestCapture: 0,
    specialVideoStartCapture: 0,
    specialVideoCompleteCapture: 0,
    gospelStartCapture: 0,
    gospelCompleteCapture: 0,
    rsvpCapture: 0,
    custom1Capture: 0,
    custom2Capture: 0,
    custom3Capture: 0,
    ...overrides
  })

  it('should track columns with non-zero values', () => {
    const columnsWithNonZero = new Set<SortableColumn>()
    const row = createMockProcessedRow({
      views: 100,
      responses: 50,
      christDecisionCapture: 25
    })

    trackNonZeroColumns(row, columnsWithNonZero)

    expect(columnsWithNonZero.has('views')).toBe(true)
    expect(columnsWithNonZero.has('responses')).toBe(true)
    expect(columnsWithNonZero.has('christDecisionCapture')).toBe(true)
    expect(columnsWithNonZero.size).toBe(3)
  })

  it('should not track columns with zero values', () => {
    const columnsWithNonZero = new Set<SortableColumn>()
    const row = createMockProcessedRow({
      views: 100,
      responses: 0,
      christDecisionCapture: 0
    })

    trackNonZeroColumns(row, columnsWithNonZero)

    expect(columnsWithNonZero.has('views')).toBe(true)
    expect(columnsWithNonZero.has('responses')).toBe(false)
    expect(columnsWithNonZero.has('christDecisionCapture')).toBe(false)
    expect(columnsWithNonZero.size).toBe(1)
  })

  it('should skip columns that are already tracked', () => {
    const columnsWithNonZero = new Set<SortableColumn>(['views', 'responses'])
    const row = createMockProcessedRow({
      views: 100,
      responses: 50,
      christDecisionCapture: 25
    })

    trackNonZeroColumns(row, columnsWithNonZero)

    expect(columnsWithNonZero.has('views')).toBe(true)
    expect(columnsWithNonZero.has('responses')).toBe(true)
    expect(columnsWithNonZero.has('christDecisionCapture')).toBe(true)
    expect(columnsWithNonZero.size).toBe(3)
  })

  it('should early exit when all columns are already tracked', () => {
    const columnsWithNonZero = new Set<SortableColumn>(NUMERIC_COLUMNS)
    const row = createMockProcessedRow({
      views: 100
    })

    // Should not throw or add anything
    trackNonZeroColumns(row, columnsWithNonZero)

    expect(columnsWithNonZero.size).toBe(NUMERIC_COLUMNS.length)
  })

  it('should early exit when all columns are found in a single row', () => {
    const columnsWithNonZero = new Set<SortableColumn>()
    const row = createMockProcessedRow({
      views: 1,
      responses: 1,
      christDecisionCapture: 1,
      prayerRequestCapture: 1,
      specialVideoStartCapture: 1,
      specialVideoCompleteCapture: 1,
      gospelStartCapture: 1,
      gospelCompleteCapture: 1,
      rsvpCapture: 1,
      custom1Capture: 1,
      custom2Capture: 1,
      custom3Capture: 1
    })

    trackNonZeroColumns(row, columnsWithNonZero)

    expect(columnsWithNonZero.size).toBe(NUMERIC_COLUMNS.length)
    NUMERIC_COLUMNS.forEach((column) => {
      expect(columnsWithNonZero.has(column)).toBe(true)
    })
  })

  it('should handle all zeros correctly', () => {
    const columnsWithNonZero = new Set<SortableColumn>()
    const row = createMockProcessedRow()

    trackNonZeroColumns(row, columnsWithNonZero)

    expect(columnsWithNonZero.size).toBe(0)
  })
})
