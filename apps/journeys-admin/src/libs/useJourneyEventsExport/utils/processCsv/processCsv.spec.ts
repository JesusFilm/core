import { TFunction } from 'next-i18next'

import { processCsv } from './processCsv'

describe('processCsv', () => {
  let originalBlob: typeof global.Blob
  let originalCreateObjectURL: typeof global.URL.createObjectURL

  beforeEach(() => {
    originalBlob = global.Blob
    originalCreateObjectURL = global.URL.createObjectURL
  })

  afterEach(() => {
    global.Blob = originalBlob
    global.URL.createObjectURL = originalCreateObjectURL
  })

  it('should process the CSV file', () => {
    // Mock Blob and URL.createObjectURL
    const mockBlob = {}
    global.Blob = jest.fn(() => mockBlob) as any
    global.URL.createObjectURL = jest.fn(() => 'mock-url')

    const eventData = [
      {
        typename: 'ButtonClickEvent',
        journeyId: 'journey1',
        visitorId: 'visitor1',
        label: 'Click Test',
        value: 'Button Value',
        journeySlug: 'test-journey',
        visitorName: 'Test User',
        visitorEmail: 'test@example.com',
        visitorPhone: '1234567890',
        createdAt: '2023-01-01T00:00:00Z'
      }
    ]

    const journeySlug = 'test-journey'
    const t = jest.fn((text: string): string => text) as unknown as TFunction

    const createElementSpy = jest.spyOn(document, 'createElement')
    const appendChildSpy = jest.spyOn(document.body, 'appendChild')
    const setAttributeSpy = jest.spyOn(
      HTMLAnchorElement.prototype,
      'setAttribute'
    )

    processCsv(eventData, journeySlug, t)

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(setAttributeSpy).toHaveBeenCalledWith(
      'download',
      expect.stringMatching(/\[\d{4}-\d{2}-\d{2}\] test-journey\.csv/)
    )
    expect(global.Blob).toHaveBeenCalledWith([expect.any(String)], {
      type: 'text/csv;charset=utf-8;'
    })
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob)
    expect(appendChildSpy).toHaveBeenCalled()
  })
})
