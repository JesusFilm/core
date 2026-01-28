import { mergeGoogleSheetsHeader } from './googleSheetsHeader'

describe('googleSheetsHeader', () => {
  describe('mergeGoogleSheetsHeader', () => {
    it('keeps base keys first, preserves existing unknown columns, and appends missing desired keys', () => {
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
    })
  })
})
