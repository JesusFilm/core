import {
  columnIndexToA1,
  createSpreadsheet,
  ensureSheet,
  readValues,
  updateRangeValues,
  writeValues
} from './sheets'

// Mock fetch globally
global.fetch = jest.fn()

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('sheets', () => {
  const mockAccessToken = 'test-access-token'
  const mockSpreadsheetId = 'spreadsheet-123'
  const mockSpreadsheetUrl =
    'https://docs.google.com/spreadsheets/d/spreadsheet-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createSpreadsheet', () => {
    it('should create spreadsheet using Drive API when folderId is provided', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: mockSpreadsheetId,
            webViewLink: mockSpreadsheetUrl
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            sheets: []
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
          text: async () => ''
        } as Response)

      const result = await createSpreadsheet({
        accessToken: mockAccessToken,
        title: 'Test Spreadsheet',
        folderId: 'folder-123',
        initialSheetTitle: 'Sheet1'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/drive/v3/files?fields=id%2C%20webViewLink',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'Test Spreadsheet',
            mimeType: 'application/vnd.google-apps.spreadsheet',
            parents: ['folder-123']
          })
        })
      )

      expect(result).toEqual({
        spreadsheetId: mockSpreadsheetId,
        spreadsheetUrl: mockSpreadsheetUrl
      })
    })

    it('should create spreadsheet using Sheets API when folderId is not provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          spreadsheetId: mockSpreadsheetId,
          spreadsheetUrl: mockSpreadsheetUrl
        })
      } as Response)

      const result = await createSpreadsheet({
        accessToken: mockAccessToken,
        title: 'Test Spreadsheet',
        initialSheetTitle: 'Sheet1'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://sheets.googleapis.com/v4/spreadsheets',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: { title: 'Test Spreadsheet' },
            sheets: [{ properties: { title: 'Sheet1' } }]
          })
        })
      )

      expect(result).toEqual({
        spreadsheetId: mockSpreadsheetId,
        spreadsheetUrl: mockSpreadsheetUrl
      })
    })

    it('should throw error when Drive API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => 'Forbidden'
      } as Response)

      await expect(
        createSpreadsheet({
          accessToken: mockAccessToken,
          title: 'Test Spreadsheet',
          folderId: 'folder-123'
        })
      ).rejects.toThrow('Drive create file failed: 403 Forbidden')
    })

    it('should throw error when Sheets API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request'
      } as Response)

      await expect(
        createSpreadsheet({
          accessToken: mockAccessToken,
          title: 'Test Spreadsheet'
        })
      ).rejects.toThrow('Sheets create spreadsheet failed: 400 Bad Request')
    })
  })

  describe('ensureSheet', () => {
    it('should return early if sheet already exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sheets: [
            { properties: { title: 'Sheet1' } },
            { properties: { title: 'ExistingSheet' } }
          ]
        })
      } as Response)

      await ensureSheet({
        accessToken: mockAccessToken,
        spreadsheetId: mockSpreadsheetId,
        sheetTitle: 'ExistingSheet'
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('batchUpdate'),
        expect.anything()
      )
    })

    it('should create sheet if it does not exist', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            sheets: [{ properties: { title: 'Sheet1' } }]
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
          text: async () => ''
        } as Response)

      await ensureSheet({
        accessToken: mockAccessToken,
        spreadsheetId: mockSpreadsheetId,
        sheetTitle: 'NewSheet'
      })

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        `https://sheets.googleapis.com/v4/spreadsheets/${mockSpreadsheetId}:batchUpdate`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [
              {
                addSheet: {
                  properties: {
                    title: 'NewSheet'
                  }
                }
              }
            ]
          })
        })
      )
    })

    it('should throw error when metadata fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not Found'
      } as Response)

      await expect(
        ensureSheet({
          accessToken: mockAccessToken,
          spreadsheetId: mockSpreadsheetId,
          sheetTitle: 'NewSheet'
        })
      ).rejects.toThrow('Sheets metadata fetch failed: 404 Not Found')
    })
  })

  describe('writeValues', () => {
    it('should write values when append is false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      } as Response)

      await writeValues({
        accessToken: mockAccessToken,
        spreadsheetId: mockSpreadsheetId,
        sheetTitle: 'Sheet1',
        values: [
          ['A1', 'B1'],
          ['A2', 'B2']
        ],
        append: false
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `https://sheets.googleapis.com/v4/spreadsheets/${mockSpreadsheetId}/values/Sheet1!A1?valueInputOption=RAW`,
        expect.objectContaining({
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [
              ['A1', 'B1'],
              ['A2', 'B2']
            ]
          })
        })
      )
    })

    it('should append values when append is true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      } as Response)

      await writeValues({
        accessToken: mockAccessToken,
        spreadsheetId: mockSpreadsheetId,
        sheetTitle: 'Sheet1',
        values: [['A3', 'B3']],
        append: true
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `https://sheets.googleapis.com/v4/spreadsheets/${mockSpreadsheetId}/values/Sheet1!A1:append?valueInputOption=RAW`,
        expect.objectContaining({
          method: 'POST'
        })
      )
    })

    it('should throw error when write fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request'
      } as Response)

      await expect(
        writeValues({
          accessToken: mockAccessToken,
          spreadsheetId: mockSpreadsheetId,
          sheetTitle: 'Sheet1',
          values: [['A1']]
        })
      ).rejects.toThrow('Sheets writeValues failed: 400 Bad Request')
    })
  })

  describe('readValues', () => {
    it('should read values from spreadsheet', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            ['A1', 'B1'],
            ['A2', 'B2']
          ]
        })
      } as Response)

      const result = await readValues({
        accessToken: mockAccessToken,
        spreadsheetId: mockSpreadsheetId,
        range: 'Sheet1!A1:B2'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `https://sheets.googleapis.com/v4/spreadsheets/${mockSpreadsheetId}/values/Sheet1!A1%3AB2`,
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockAccessToken}`
          }
        })
      )

      expect(result).toEqual([
        ['A1', 'B1'],
        ['A2', 'B2']
      ])
    })

    it('should handle null values', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: [
            ['A1', null, 'C1'],
            [null, 'B2', 'C2']
          ]
        })
      } as Response)

      const result = await readValues({
        accessToken: mockAccessToken,
        spreadsheetId: mockSpreadsheetId,
        range: 'Sheet1!A1:C2'
      })

      expect(result).toEqual([
        ['A1', null, 'C1'],
        [null, 'B2', 'C2']
      ])
    })

    it('should return empty array when no values', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          values: []
        })
      } as Response)

      const result = await readValues({
        accessToken: mockAccessToken,
        spreadsheetId: mockSpreadsheetId,
        range: 'Sheet1!A1:B2'
      })

      expect(result).toEqual([])
    })

    it('should throw error when read fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => 'Forbidden'
      } as Response)

      await expect(
        readValues({
          accessToken: mockAccessToken,
          spreadsheetId: mockSpreadsheetId,
          range: 'Sheet1!A1:B2'
        })
      ).rejects.toThrow('Sheets readValues failed: 403 Forbidden')
    })
  })

  describe('columnIndexToA1', () => {
    it('should convert 0-based column index to A1 notation', () => {
      expect(columnIndexToA1(0)).toBe('A')
      expect(columnIndexToA1(1)).toBe('B')
      expect(columnIndexToA1(25)).toBe('Z')
      expect(columnIndexToA1(26)).toBe('AA')
      expect(columnIndexToA1(27)).toBe('AB')
      expect(columnIndexToA1(51)).toBe('AZ')
      expect(columnIndexToA1(52)).toBe('BA')
    })
  })

  describe('updateRangeValues', () => {
    it('should update range values', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      } as Response)

      await updateRangeValues({
        accessToken: mockAccessToken,
        spreadsheetId: mockSpreadsheetId,
        range: 'Sheet1!A1:B2',
        values: [
          ['A1', 'B1'],
          ['A2', 'B2']
        ]
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `https://sheets.googleapis.com/v4/spreadsheets/${mockSpreadsheetId}/values/Sheet1!A1%3AB2?valueInputOption=RAW`,
        expect.objectContaining({
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [
              ['A1', 'B1'],
              ['A2', 'B2']
            ]
          })
        })
      )
    })

    it('should throw error when update fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request'
      } as Response)

      await expect(
        updateRangeValues({
          accessToken: mockAccessToken,
          spreadsheetId: mockSpreadsheetId,
          range: 'Sheet1!A1:B2',
          values: [['A1']]
        })
      ).rejects.toThrow('Sheets updateRangeValues failed: 400 Bad Request')
    })
  })
})
