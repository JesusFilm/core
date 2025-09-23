
import { format } from 'date-fns'

import { JourneyContact } from '../../useJourneyEventsExport'

import {
  getContactsCsvOptions,
  processContactsCsv
} from './processContactsCsv'

// Mock dependencies
jest.mock('csv-stringify/sync', () => ({
  stringify: jest.fn(() => 'csv,content\nJohn,john@example.com\n')
}))

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

describe('processContactsCsv', () => {
  const mockT = jest.fn((key: string) => key) as jest.MockedFunction<any>
  const mockContacts: JourneyContact[] = [
    {
      visitorId: 'visitor1',
      visitorName: 'John Doe',
      visitorEmail: 'john@example.com',
      visitorPhone: '+1234567890',
      journeyId: 'journey1',
      journeySlug: 'test-journey'
    },
    {
      visitorId: 'visitor2',
      visitorName: 'Jane Smith',
      visitorEmail: 'jane@example.com',
      visitorPhone: null,
      journeyId: 'journey1',
      journeySlug: 'test-journey'
    },
    {
      visitorId: 'visitor3',
      visitorName: null,
      visitorEmail: 'bob@example.com',
      visitorPhone: '+9876543210',
      journeyId: 'journey1',
      journeySlug: 'test-journey'
    }
  ]

  const mockLinkElement = {
    target: '',
    href: '',
    setAttribute: mockSetAttribute,
    click: mockClick
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateElement.mockReturnValue(mockLinkElement)
    mockT.mockImplementation((key: string) => key)
  })

  describe('getContactsCsvOptions', () => {
    it('should return all columns when all contact data fields are selected', () => {
      const contactDataFields = ['name', 'email', 'phone']
      const result = getContactsCsvOptions(mockT, contactDataFields)

      expect(result).toEqual({
        header: true,
        columns: [
          { key: 'visitorName', header: 'Name' },
          { key: 'visitorEmail', header: 'Email' },
          { key: 'visitorPhone', header: 'Phone' }
        ]
      })
    })

    it('should return only selected columns when partial contact data fields are selected', () => {
      const contactDataFields = ['name', 'email']
      const result = getContactsCsvOptions(mockT, contactDataFields)

      expect(result).toEqual({
        header: true,
        columns: [
          { key: 'visitorName', header: 'Name' },
          { key: 'visitorEmail', header: 'Email' }
        ]
      })
    })

    it('should return single column when only one contact data field is selected', () => {
      const contactDataFields = ['phone']
      const result = getContactsCsvOptions(mockT, contactDataFields)

      expect(result).toEqual({
        header: true,
        columns: [{ key: 'visitorPhone', header: 'Phone' }]
      })
    })
  })

  describe('processContactsCsv', () => {
    it('should process and download CSV with all contact data fields', () => {
      const contactDataFields = ['name', 'email', 'phone']
      const journeySlug = 'test-journey'

      processContactsCsv(mockContacts, journeySlug, mockT, contactDataFields)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockSetAttribute).toHaveBeenCalledWith(
        'download',
        '[2023-01-01] test-journey_contacts.csv'
      )
      expect(mockAppendChild).toHaveBeenCalledWith(mockLinkElement)
      expect(mockClick).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLinkElement)
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:url')
    })

    it('should filter contacts based on selected fields', () => {
      const contactDataFields = ['name', 'email']
      const journeySlug = 'test-journey'

      processContactsCsv(mockContacts, journeySlug, mockT, contactDataFields)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('should throw error when no contacts have valid data for selected fields', () => {
      const emptyContacts: JourneyContact[] = [
        {
          visitorId: 'visitor1',
          visitorName: null,
          visitorEmail: null,
          visitorPhone: null,
          journeyId: 'journey1',
          journeySlug: 'test-journey'
        }
      ]
      const contactDataFields = ['name', 'email', 'phone']
      const journeySlug = 'test-journey'

      expect(() => {
        processContactsCsv(emptyContacts, journeySlug, mockT, contactDataFields)
      }).toThrow('No contacts found with data for the selected fields')
    })

    it('should handle contacts with partial data correctly', () => {
      const partialContacts: JourneyContact[] = [
        {
          visitorId: 'visitor1',
          visitorName: 'John Doe',
          visitorEmail: null,
          visitorPhone: null,
          journeyId: 'journey1',
          journeySlug: 'test-journey'
        }
      ]
      const contactDataFields = ['name']
      const journeySlug = 'test-journey'

      processContactsCsv(partialContacts, journeySlug, mockT, contactDataFields)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('should create correct filename with current date', () => {
      const contactDataFields = ['name']
      const journeySlug = 'my-test-journey'

      processContactsCsv(mockContacts, journeySlug, mockT, contactDataFields)

      expect(format).toHaveBeenCalledWith(expect.any(Date), 'yyyy-MM-dd')
      expect(mockSetAttribute).toHaveBeenCalledWith(
        'download',
        '[2023-01-01] my-test-journey_contacts.csv'
      )
    })

    it('should set link attributes correctly', () => {
      const contactDataFields = ['name']
      const journeySlug = 'test-journey'

      processContactsCsv(mockContacts, journeySlug, mockT, contactDataFields)

      expect(mockLinkElement.target).toBe('_blank')
      expect(mockLinkElement.href).toBe('blob:url')
    })
  })
})
