import { mergeGoogleSheetsHeader } from './googleSheetsHeader'

describe('googleSheetsHeader', () => {
  describe('mergeGoogleSheetsHeader', () => {
    it('keeps base keys first, preserves existing unknown columns, and appends missing desired keys (legacy mode - no blockId row)', () => {
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
      const existingHeaderRowLabels = ['Visitor ID', 'Legacy Column', 'Date']

      const merged = mergeGoogleSheetsHeader({
        baseKeys: ['visitorId', 'date'],
        columns,
        desiredHeaderKeys,
        existingHeaderRowLabels,
        existingBlockIdRow: [], // Empty = legacy mode, use label-based matching
        userTimezone: 'UTC',
        getCardHeading: () => '',
        baseColumnLabelResolver: ({ column }) => column.label
      })

      // Base keys first, then existing unknown column (as its own key), then missing desired keys.
      expect(merged.finalHeaderKeys).toEqual([
        'visitorId',
        'date',
        'Legacy Column',
        'b1-Name'
      ])

      // Unknown columns should keep their existing label in the header row.
      expect(merged.finalHeaderRowLabels).toEqual([
        'Visitor ID',
        'Date',
        'Legacy Column',
        'Name'
      ])

      // BlockId row should match keys
      expect(merged.finalBlockIdRow).toEqual([
        'visitorId',
        'date',
        'Legacy Column',
        'b1-Name'
      ])
    })

    it('uses blockId row for stable column matching when present', () => {
      const columns = [
        { key: 'visitorId', label: 'Visitor ID', blockId: null, typename: '' },
        { key: 'date', label: 'Date', blockId: null, typename: '' },
        {
          key: 'b1-Name',
          label: 'Name',
          blockId: 'b1',
          typename: 'TextResponseBlock'
        },
        {
          key: 'b2-Email',
          label: 'Email',
          blockId: 'b2',
          typename: 'TextResponseBlock'
        }
      ]

      const desiredHeaderKeys = ['visitorId', 'date', 'b1-Name', 'b2-Email']
      // Labels might have changed, but blockId row is stable
      const existingHeaderRowLabels = [
        'Visitor ID',
        'Date',
        'Old Name Label'
      ]
      const existingBlockIdRow = ['visitorId', 'date', 'b1-Name']

      const merged = mergeGoogleSheetsHeader({
        baseKeys: ['visitorId', 'date'],
        columns,
        desiredHeaderKeys,
        existingHeaderRowLabels,
        existingBlockIdRow,
        userTimezone: 'UTC',
        getCardHeading: () => '',
        baseColumnLabelResolver: ({ column }) => column.label
      })

      // Column order preserved from blockId row, new column appended
      expect(merged.finalHeaderKeys).toEqual([
        'visitorId',
        'date',
        'b1-Name',
        'b2-Email'
      ])

      // Labels updated to current values
      expect(merged.finalHeaderRowLabels).toEqual([
        'Visitor ID',
        'Date',
        'Name',
        'Email'
      ])

      // BlockId row matches keys
      expect(merged.finalBlockIdRow).toEqual([
        'visitorId',
        'date',
        'b1-Name',
        'b2-Email'
      ])
    })

    it('preserves column order from blockId row, only appends new columns', () => {
      const columns = [
        { key: 'visitorId', label: 'Visitor ID', blockId: null, typename: '' },
        { key: 'date', label: 'Date', blockId: null, typename: '' },
        {
          key: 'b1-Q1',
          label: 'Q1',
          blockId: 'b1',
          typename: 'RadioQuestionBlock'
        },
        {
          key: 'b2-Q2',
          label: 'Q2',
          blockId: 'b2',
          typename: 'RadioQuestionBlock'
        },
        {
          key: 'b3-Q3',
          label: 'Q3',
          blockId: 'b3',
          typename: 'RadioQuestionBlock'
        }
      ]

      // Desired order is Q1, Q2, Q3 but existing sheet has Q2, Q1
      const existingBlockIdRow = ['visitorId', 'date', 'b2-Q2', 'b1-Q1']
      const existingHeaderRowLabels = ['Visitor ID', 'Date', 'Poll (Q2)', 'Poll (Q1)']
      const desiredHeaderKeys = ['visitorId', 'date', 'b1-Q1', 'b2-Q2', 'b3-Q3']

      const merged = mergeGoogleSheetsHeader({
        baseKeys: ['visitorId', 'date'],
        columns,
        desiredHeaderKeys,
        existingHeaderRowLabels,
        existingBlockIdRow,
        userTimezone: 'UTC',
        getCardHeading: () => '',
        baseColumnLabelResolver: ({ column }) => column.label
      })

      // Order from blockId row preserved, new column (b3) appended at end
      expect(merged.finalHeaderKeys).toEqual([
        'visitorId',
        'date',
        'b2-Q2',
        'b1-Q1',
        'b3-Q3'
      ])
    })
  })
})
