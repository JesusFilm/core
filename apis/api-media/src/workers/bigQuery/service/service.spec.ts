import { importShortLinks } from '../importers'

import { service } from './service'

jest.mock('../importers', () => ({
  importShortLinks: jest.fn()
}))

describe('bigQuery/service', () => {
  describe('service', () => {
    it('should call importers', async () => {
      await service()
      expect(importShortLinks).toHaveBeenCalled()
    })
  })
})
