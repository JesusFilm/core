import { hardenPrompt } from './hardeningPrompt'
import { preSystemPrompt } from './preSystemPrompt'

jest.mock('./hardeningPrompt', () => ({
  hardenPrompt: jest.fn((text) => `«${text}»`),
  hardeningPrompt: 'MOCK_HARDENING_PROMPT'
}))

describe('preSystemPrompt', () => {
  it('should be a string', () => {
    expect(typeof preSystemPrompt).toBe('string')
  })

  it('should use the hardening prompt', () => {
    expect(preSystemPrompt).toBe('MOCK_HARDENING_PROMPT')
  })
})

describe('hardenPrompt', () => {
  it('should be properly imported', () => {
    expect(typeof hardenPrompt).toBe('function')
    expect(hardenPrompt('test')).toBe('«test»')
  })
})
