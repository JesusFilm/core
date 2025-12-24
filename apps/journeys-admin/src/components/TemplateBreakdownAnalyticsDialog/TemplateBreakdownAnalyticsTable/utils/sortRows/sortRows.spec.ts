import { Order, ProcessedRow, SortableColumn } from '../types'
import { sortRows } from './sortRows'

describe('sortRows', () => {
  const createMockProcessedRow = (
    journeyName: string,
    overrides: Partial<ProcessedRow> = {}
  ): ProcessedRow => ({
    __typename: 'TemplateFamilyStatsBreakdownResponse',
    journeyId: `journey-${journeyName}`,
    journeyName,
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

  describe('numeric sorting', () => {
    it('should sort rows by numeric column in ascending order', () => {
      const rows: ProcessedRow[] = [
        createMockProcessedRow('A', { views: 100 }),
        createMockProcessedRow('B', { views: 50 }),
        createMockProcessedRow('C', { views: 200 })
      ]

      const sorted = sortRows(rows, 'views', 'asc')

      expect(sorted[0].journeyName).toBe('B')
      expect(sorted[1].journeyName).toBe('A')
      expect(sorted[2].journeyName).toBe('C')
    })

    it('should sort rows by numeric column in descending order', () => {
      const rows: ProcessedRow[] = [
        createMockProcessedRow('A', { views: 100 }),
        createMockProcessedRow('B', { views: 50 }),
        createMockProcessedRow('C', { views: 200 })
      ]

      const sorted = sortRows(rows, 'views', 'desc')

      expect(sorted[0].journeyName).toBe('C')
      expect(sorted[1].journeyName).toBe('A')
      expect(sorted[2].journeyName).toBe('B')
    })

    it('should handle zero values correctly', () => {
      const rows: ProcessedRow[] = [
        createMockProcessedRow('A', { views: 0 }),
        createMockProcessedRow('B', { views: 100 }),
        createMockProcessedRow('C', { views: 0 })
      ]

      const sorted = sortRows(rows, 'views', 'asc')

      expect(sorted[0].journeyName).toBe('A')
      expect(sorted[1].journeyName).toBe('C')
      expect(sorted[2].journeyName).toBe('B')
    })

    it('should handle negative values correctly', () => {
      const rows: ProcessedRow[] = [
        createMockProcessedRow('A', { views: -10 }),
        createMockProcessedRow('B', { views: 100 }),
        createMockProcessedRow('C', { views: 0 })
      ]

      const sorted = sortRows(rows, 'views', 'asc')

      expect(sorted[0].journeyName).toBe('A')
      expect(sorted[1].journeyName).toBe('C')
      expect(sorted[2].journeyName).toBe('B')
    })
  })

  describe('string sorting', () => {
    it('should sort rows by string column in ascending order', () => {
      const rows: ProcessedRow[] = [
        createMockProcessedRow('Charlie'),
        createMockProcessedRow('Alpha'),
        createMockProcessedRow('Bravo')
      ]

      const sorted = sortRows(rows, 'journeyName', 'asc')

      expect(sorted[0].journeyName).toBe('Alpha')
      expect(sorted[1].journeyName).toBe('Bravo')
      expect(sorted[2].journeyName).toBe('Charlie')
    })

    it('should sort rows by string column in descending order', () => {
      const rows: ProcessedRow[] = [
        createMockProcessedRow('Charlie'),
        createMockProcessedRow('Alpha'),
        createMockProcessedRow('Bravo')
      ]

      const sorted = sortRows(rows, 'journeyName', 'desc')

      expect(sorted[0].journeyName).toBe('Charlie')
      expect(sorted[1].journeyName).toBe('Bravo')
      expect(sorted[2].journeyName).toBe('Alpha')
    })
  })

  it('should not mutate the original array', () => {
    const rows: ProcessedRow[] = [
      createMockProcessedRow('A', { views: 100 }),
      createMockProcessedRow('B', { views: 50 })
    ]
    const originalRows = [...rows]

    const sorted = sortRows(rows, 'views', 'asc')

    expect(rows).toEqual(originalRows)
    expect(sorted).not.toBe(rows)
  })

  it('should handle empty array', () => {
    const rows: ProcessedRow[] = []

    const sorted = sortRows(rows, 'views', 'asc')

    expect(sorted).toEqual([])
  })

  it('should handle single row', () => {
    const rows: ProcessedRow[] = [createMockProcessedRow('A', { views: 100 })]

    const sorted = sortRows(rows, 'views', 'asc')

    expect(sorted).toEqual(rows)
    expect(sorted).not.toBe(rows) // Should be a new array
  })

  it('should handle all numeric columns', () => {
    const numericColumns: SortableColumn[] = [
      'views',
      'responses',
      'christDecisionCapture',
      'prayerRequestCapture',
      'specialVideoStartCapture',
      'specialVideoCompleteCapture',
      'gospelStartCapture',
      'gospelCompleteCapture',
      'rsvpCapture',
      'custom1Capture',
      'custom2Capture',
      'custom3Capture'
    ]

    numericColumns.forEach((column) => {
      const rows: ProcessedRow[] = [
        createMockProcessedRow('A', { [column]: 100 } as Partial<ProcessedRow>),
        createMockProcessedRow('B', { [column]: 50 } as Partial<ProcessedRow>)
      ]

      const sortedAsc = sortRows(rows, column, 'asc')
      expect(sortedAsc[0].journeyName).toBe('B')
      expect(sortedAsc[1].journeyName).toBe('A')

      const sortedDesc = sortRows(rows, column, 'desc')
      expect(sortedDesc[0].journeyName).toBe('A')
      expect(sortedDesc[1].journeyName).toBe('B')
    })
  })
})

