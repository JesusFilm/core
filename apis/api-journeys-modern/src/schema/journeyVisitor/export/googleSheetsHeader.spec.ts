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

    it('uses exportOrder to resolve ambiguous labels (e.g., multiple Poll columns)', () => {
      // Scenario: Two poll blocks with the same display label "Poll"
      // The first poll has exportOrder=1, the second poll is new (no exportOrder yet)
      const columns = [
        { key: 'visitorId', label: 'Visitor ID', blockId: null, typename: '' },
        { key: 'date', label: 'Date', blockId: null, typename: '' },
        {
          key: 'poll1-Question1',
          label: 'Question1',
          blockId: 'poll1',
          typename: 'RadioQuestionBlock',
          exportOrder: 1 // This poll was synced before and has exportOrder
        },
        {
          key: 'poll2-Question2',
          label: 'Question2',
          blockId: 'poll2',
          typename: 'RadioQuestionBlock',
          exportOrder: null // This is a new poll, no exportOrder yet
        }
      ]

      const desiredHeaderKeys = [
        'visitorId',
        'date',
        'poll1-Question1',
        'poll2-Question2'
      ]

      // Existing sheet has "Poll" in column C (index 2), which is ambiguous
      // because both poll blocks would generate the label "Poll" (no card heading)
      const existingHeaderRowLabels = ['Visitor ID', 'Date', 'Poll']

      const merged = mergeGoogleSheetsHeader({
        baseKeys: ['visitorId', 'date'],
        columns,
        desiredHeaderKeys,
        existingHeaderRowLabels,
        userTimezone: 'UTC',
        // Both polls would show as "Poll" (no card heading)
        getCardHeading: () => '',
        baseColumnLabelResolver: ({ column }) => column.label
      })

      // The first poll with exportOrder=1 should match position 2 (baseKeys.length + 1 - 1)
      // The second poll should be appended at the end
      expect(merged.finalHeaderKeys).toEqual([
        'visitorId',
        'date',
        'poll1-Question1', // Matched by exportOrder position
        'poll2-Question2' // Appended as new column
      ])
    })

    it('handles multiple blocks with exportOrder at existing positions', () => {
      // Scenario: Two blocks with exportOrder, both already in the sheet
      const columns = [
        { key: 'visitorId', label: 'Visitor ID', blockId: null, typename: '' },
        { key: 'date', label: 'Date', blockId: null, typename: '' },
        {
          key: 'b1-Label1',
          label: 'Label1',
          blockId: 'b1',
          typename: 'RadioQuestionBlock',
          exportOrder: 1
        },
        {
          key: 'b2-Label2',
          label: 'Label2',
          blockId: 'b2',
          typename: 'RadioQuestionBlock',
          exportOrder: 2
        }
      ]

      const desiredHeaderKeys = ['visitorId', 'date', 'b1-Label1', 'b2-Label2']

      // Both columns exist in the sheet (with potentially different labels)
      const existingHeaderRowLabels = ['Visitor ID', 'Date', 'Poll 1', 'Poll 2']

      const merged = mergeGoogleSheetsHeader({
        baseKeys: ['visitorId', 'date'],
        columns,
        desiredHeaderKeys,
        existingHeaderRowLabels,
        userTimezone: 'UTC',
        getCardHeading: () => '',
        baseColumnLabelResolver: ({ column }) => column.label
      })

      // Both blocks should be matched by their exportOrder positions
      expect(merged.finalHeaderKeys).toEqual([
        'visitorId',
        'date',
        'b1-Label1', // exportOrder=1 -> position 2
        'b2-Label2' // exportOrder=2 -> position 3
      ])
    })
  })
})
