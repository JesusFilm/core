import { TFunction } from 'next-i18next'

import { processCsv } from './processCsv'

describe('processCsv', () => {
  it('should process the CSV file', () => {
    const eventData = []
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
    expect(appendChildSpy).toHaveBeenCalled()
  })
})
