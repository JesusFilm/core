import { getIteration, getSeoSlug } from './api-seed'

describe('apiSeed', () => {
  describe('getIteration', () => {
    it('should return the slug if it does not exist in the collection', () => {
      const collection = []
      expect(getIteration('test', collection)).toBe('test')
    })
    it('should return the slug with an iteration if it does exist in the collection', () => {
      const collection = ['test']
      expect(getIteration('test', collection)).toBe('test-2')
    })
    it('should return the slug with an iteration if it does exist in the collection', () => {
      const collection = ['test', 'test-2']
      expect(getIteration('test', collection)).toBe('test-3')
    })
  })
  describe('getSeoSlug', () => {
    const collection = []
    it('should iterate automatically', () => {
      expect(getSeoSlug('test', collection)).toBe('test')
      expect(getSeoSlug('test', collection)).toBe('test-2')
      expect(getSeoSlug('test', collection)).toBe('test-3')
    })
  })
})
