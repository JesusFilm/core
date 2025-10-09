import { waitFor } from '@testing-library/react'
import { format } from 'date-fns'

import { downloadCsv } from '.'

// Mock dependencies
jest.mock('date-fns', () => ({
  format: jest.fn(() => '2023-01-01')
}))

// Mock DOM methods
const mockCreateElement = jest.fn()
const mockAppendChild = jest.fn()
const mockRemoveChild = jest.fn()
const mockClick = jest.fn()
const mockSetAttribute = jest.fn()
const mockCreateObjectURL = jest.fn(() => 'blob:url')
const mockRevokeObjectURL = jest.fn()

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true
})

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
  writable: true
})

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
  writable: true
})

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL
  },
  writable: true
})

describe('downloadCsv', () => {
  const mockLinkElement = {
    href: '',
    setAttribute: mockSetAttribute,
    click: mockClick
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateElement.mockReturnValue(mockLinkElement)
  })

  it('should create and download CSV file with default filename', async () => {
    const csvContent = 'Name,Email\nJohn Doe,john@example.com'

    downloadCsv(csvContent)

    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(mockCreateElement).toHaveBeenCalledWith('a')
    expect(mockSetAttribute).toHaveBeenCalledWith(
      'download',
      '[2023-01-01] data.csv'
    )
    expect(mockAppendChild).toHaveBeenCalledWith(mockLinkElement)
    expect(mockClick).toHaveBeenCalled()
    await waitFor(() => {
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLinkElement)
    })
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:url')
  })

  it('should create and download CSV file with custom filename', () => {
    const csvContent = 'Name,Email\nJohn Doe,john@example.com'
    const customFilename = 'custom-export'

    downloadCsv(csvContent, customFilename)

    expect(mockSetAttribute).toHaveBeenCalledWith(
      'download',
      '[2023-01-01] custom-export.csv'
    )
  })

  it('should create blob with correct content type', () => {
    const csvContent = 'Name,Email\nJohn Doe,john@example.com'

    downloadCsv(csvContent)

    expect(mockCreateObjectURL).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'text/csv;charset=utf-8;'
      })
    )
  })

  it('should set link href to blob URL', () => {
    const csvContent = 'Name,Email\nJohn Doe,john@example.com'

    downloadCsv(csvContent)

    expect(mockLinkElement.href).toBe('blob:url')
  })

  it('should format current date correctly', () => {
    const csvContent = 'Name,Email\nJohn Doe,john@example.com'

    downloadCsv(csvContent)

    expect(format).toHaveBeenCalledWith(expect.any(Date), 'yyyy-MM-dd')
  })

  it('should handle empty CSV content', () => {
    const csvContent = ''

    downloadCsv(csvContent)

    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(mockClick).toHaveBeenCalled()
  })

  it('should handle special characters in filename', () => {
    const csvContent = 'Name,Email\nJohn Doe,john@example.com'
    const filenameWithSpecialChars = 'test/file-name'

    downloadCsv(csvContent, filenameWithSpecialChars)

    expect(mockSetAttribute).toHaveBeenCalledWith(
      'download',
      '[2023-01-01] test/file-name.csv'
    )
  })
})
