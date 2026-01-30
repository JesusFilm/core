import { mergeGoogleSheetsHeader } from './googleSheetsHeader'

describe('googleSheetsHeader', () => {
  describe('mergeGoogleSheetsHeader', () => {
    it('preserves existing header order exactly and appends new columns at the end', () => {
      const columns = [
        { key: 'visitorId', label: 'Visitor ID', blockId: null, typename: '' },
        { key: 'date', label: 'Date', blockId: null, typename: '' },
        {
          key: 'b1-Name',
          label: 'Name',
          blockId: 'b1',
          typename: 'TextResponseBlock'
        }
      ]

      const desiredHeaderKeys = ['visitorId', 'date', 'b1-Name']
      // Existing sheet has different order: Visitor ID, Legacy Column, Date
      const existingHeaderRowLabels = ['Visitor ID', 'Legacy Column', 'Date']

      const merged = mergeGoogleSheetsHeader({
        baseKeys: ['visitorId', 'date'],
        columns,
        desiredHeaderKeys,
        existingHeaderRowLabels,
        userTimezone: 'UTC',
        getCardHeading: () => '',
        baseColumnLabelResolver: ({ column }) => column.label
      })

      // Existing order should be preserved EXACTLY, new columns appended at end
      expect(merged.finalHeaderKeys).toEqual([
        'visitorId',
        'Legacy Column',
        'date',
        'b1-Name'
      ])

      // Labels should match the preserved order
      expect(merged.finalHeaderRowLabels).toEqual([
        'Visitor ID',
        'Legacy Column',
        'Date',
        'Name'
      ])
    })

    it('uses base keys first when sheet is empty (new sheet)', () => {
      const columns = [
        { key: 'visitorId', label: 'Visitor ID', blockId: null, typename: '' },
        { key: 'date', label: 'Date', blockId: null, typename: '' },
        {
          key: 'b1-Name',
          label: 'Name',
          blockId: 'b1',
          typename: 'TextResponseBlock'
        }
      ]

      const desiredHeaderKeys = ['visitorId', 'date', 'b1-Name']
      const existingHeaderRowLabels: string[] = []

      const merged = mergeGoogleSheetsHeader({
        baseKeys: ['visitorId', 'date'],
        columns,
        desiredHeaderKeys,
        existingHeaderRowLabels,
        userTimezone: 'UTC',
        getCardHeading: () => '',
        baseColumnLabelResolver: ({ column }) => column.label
      })

      // New sheet: base keys first, then desired keys in order
      expect(merged.finalHeaderKeys).toEqual(['visitorId', 'date', 'b1-Name'])
      expect(merged.finalHeaderRowLabels).toEqual([
        'Visitor ID',
        'Date',
        'Name'
      ])
    })

    it('never moves existing columns when new columns are added', () => {
      const columns = [
        { key: 'visitorId', label: 'Visitor ID', blockId: null, typename: '' },
        { key: 'date', label: 'Date', blockId: null, typename: '' },
        {
          key: 'b1-Email',
          label: 'Email',
          blockId: 'b1',
          typename: 'TextResponseBlock'
        },
        {
          key: 'b2-Phone',
          label: 'Phone',
          blockId: 'b2',
          typename: 'TextResponseBlock'
        }
      ]

      const desiredHeaderKeys = ['visitorId', 'date', 'b1-Email', 'b2-Phone']
      // Existing sheet already has visitorId, date, Email
      const existingHeaderRowLabels = ['Visitor ID', 'Date', 'Email']

      const merged = mergeGoogleSheetsHeader({
        baseKeys: ['visitorId', 'date'],
        columns,
        desiredHeaderKeys,
        existingHeaderRowLabels,
        userTimezone: 'UTC',
        getCardHeading: () => '',
        baseColumnLabelResolver: ({ column }) => column.label
      })

      // Original columns stay in their positions, new column appended
      expect(merged.finalHeaderKeys).toEqual([
        'visitorId',
        'date',
        'b1-Email',
        'b2-Phone'
      ])
      expect(merged.finalHeaderRowLabels).toEqual([
        'Visitor ID',
        'Date',
        'Email',
        'Phone'
      ])
    })

    it('preserves empty columns in existing headers to maintain positions', () => {
      const columns = [
        { key: 'visitorId', label: 'Visitor ID', blockId: null, typename: '' },
        { key: 'date', label: 'Date', blockId: null, typename: '' }
      ]

      const desiredHeaderKeys = ['visitorId', 'date']
      // Existing sheet has empty column between visitorId and date
      const existingHeaderRowLabels = ['Visitor ID', '', 'Date']

      const merged = mergeGoogleSheetsHeader({
        baseKeys: ['visitorId', 'date'],
        columns,
        desiredHeaderKeys,
        existingHeaderRowLabels,
        userTimezone: 'UTC',
        getCardHeading: () => '',
        baseColumnLabelResolver: ({ column }) => column.label
      })

      // Empty columns in the middle are preserved to maintain positions
      // (column A = visitorId, column B = empty, column C = date)
      expect(merged.finalHeaderKeys).toEqual(['visitorId', '', 'date'])
    })

    it('respects exportOrder when creating columns for new sheet', () => {
      const columns = [
        { key: 'visitorId', label: 'Visitor ID', blockId: null, typename: '' },
        { key: 'date', label: 'Date', blockId: null, typename: '' },
        {
          key: 'b2-Second',
          label: 'Second',
          blockId: 'b2',
          typename: 'TextResponseBlock',
          exportOrder: 2
        },
        {
          key: 'b1-First',
          label: 'First',
          blockId: 'b1',
          typename: 'TextResponseBlock',
          exportOrder: 1
        }
      ]

      // Keys ordered by exportOrder (b1 first, then b2)
      const desiredHeaderKeys = ['visitorId', 'date', 'b1-First', 'b2-Second']
      const existingHeaderRowLabels: string[] = []

      const merged = mergeGoogleSheetsHeader({
        baseKeys: ['visitorId', 'date'],
        columns,
        desiredHeaderKeys,
        existingHeaderRowLabels,
        userTimezone: 'UTC',
        getCardHeading: () => '',
        baseColumnLabelResolver: ({ column }) => column.label
      })

      // New sheet should use the exportOrder-based ordering from desiredHeaderKeys
      expect(merged.finalHeaderKeys).toEqual([
        'visitorId',
        'date',
        'b1-First',
        'b2-Second'
      ])
    })
  })
})
