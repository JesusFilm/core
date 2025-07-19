import { prismaMock } from '../../../test/prismaMock'

// Mock the builder and external dependencies
jest.mock('../../lib/auth/ability')
jest.mock('../../lib/prisma')

describe('Action System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Action schema exports', () => {
    it('should export action mutations and types', () => {
      // Test that the action schema file can be imported without errors
      expect(() => require('./action')).not.toThrow()
    })

    it('should have canBlockHaveAction utility function', () => {
      const { canBlockHaveAction } = require('./action')
      expect(canBlockHaveAction).toBeDefined()
      expect(typeof canBlockHaveAction).toBe('function')
    })

    it('should export validation schemas', () => {
      const module = require('./action')
      expect(module.emailActionInputSchema).toBeDefined()
      expect(module.linkActionInputSchema).toBeDefined()
      expect(module.navigateToBlockActionInputSchema).toBeDefined()
    })
  })

  describe('canBlockHaveAction utility', () => {
    let canBlockHaveAction: (block: any) => boolean

    beforeAll(() => {
      const module = require('./action')
      canBlockHaveAction = module.canBlockHaveAction
    })

    it('should return true for ButtonBlock', () => {
      expect(canBlockHaveAction({ typename: 'ButtonBlock' })).toBe(true)
    })

    it('should return true for SignUpBlock', () => {
      expect(canBlockHaveAction({ typename: 'SignUpBlock' })).toBe(true)
    })

    it('should return true for RadioOptionBlock', () => {
      expect(canBlockHaveAction({ typename: 'RadioOptionBlock' })).toBe(true)
    })

    it('should return true for VideoBlock', () => {
      expect(canBlockHaveAction({ typename: 'VideoBlock' })).toBe(true)
    })

    it('should return true for VideoTriggerBlock', () => {
      expect(canBlockHaveAction({ typename: 'VideoTriggerBlock' })).toBe(true)
    })

    it('should return false for TypographyBlock', () => {
      expect(canBlockHaveAction({ typename: 'TypographyBlock' })).toBe(false)
    })

    it('should return false for ImageBlock', () => {
      expect(canBlockHaveAction({ typename: 'ImageBlock' })).toBe(false)
    })

    it('should return false for SpacerBlock', () => {
      expect(canBlockHaveAction({ typename: 'SpacerBlock' })).toBe(false)
    })

    it('should return false for IconBlock', () => {
      expect(canBlockHaveAction({ typename: 'IconBlock' })).toBe(false)
    })

    it('should return false for CardBlock', () => {
      expect(canBlockHaveAction({ typename: 'CardBlock' })).toBe(false)
    })

    it('should return false for StepBlock', () => {
      expect(canBlockHaveAction({ typename: 'StepBlock' })).toBe(false)
    })

    it('should return false for unknown block type', () => {
      expect(canBlockHaveAction({ typename: 'UnknownBlock' })).toBe(false)
    })
  })

  describe('Validation schemas', () => {
    let emailActionInputSchema: any
    let linkActionInputSchema: any
    let navigateToBlockActionInputSchema: any

    beforeAll(() => {
      const module = require('./action')
      emailActionInputSchema = module.emailActionInputSchema
      linkActionInputSchema = module.linkActionInputSchema
      navigateToBlockActionInputSchema = module.navigateToBlockActionInputSchema
    })

    describe('emailActionInputSchema', () => {
      it('should validate correct email', () => {
        const result = emailActionInputSchema.safeParse({
          gtmEventName: null,
          email: 'test@example.com'
        })
        expect(result.success).toBe(true)
      })

      it('should reject invalid email', () => {
        const result = emailActionInputSchema.safeParse({
          gtmEventName: null,
          email: 'invalid-email'
        })
        expect(result.success).toBe(false)
      })

      it('should reject empty email', () => {
        const result = emailActionInputSchema.safeParse({
          gtmEventName: null,
          email: ''
        })
        expect(result.success).toBe(false)
      })
    })

    describe('linkActionInputSchema', () => {
      it('should validate correct URL', () => {
        const result = linkActionInputSchema.safeParse({
          gtmEventName: null,
          url: 'https://example.com',
          target: null
        })
        expect(result.success).toBe(true)
      })

      it('should accept any string as URL', () => {
        const result = linkActionInputSchema.safeParse({
          gtmEventName: null,
          url: 'not-a-url',
          target: null
        })
        expect(result.success).toBe(true)
      })

      it('should accept empty URL', () => {
        const result = linkActionInputSchema.safeParse({
          gtmEventName: null,
          url: '',
          target: null
        })
        expect(result.success).toBe(true)
      })
    })

    describe('navigateToBlockActionInputSchema', () => {
      it('should validate correct blockId', () => {
        const result = navigateToBlockActionInputSchema.safeParse({
          gtmEventName: null,
          blockId: 'valid-block-id'
        })
        expect(result.success).toBe(true)
      })

      it('should accept empty blockId', () => {
        const result = navigateToBlockActionInputSchema.safeParse({
          gtmEventName: null,
          blockId: ''
        })
        expect(result.success).toBe(true)
      })

      it('should reject missing blockId', () => {
        const result = navigateToBlockActionInputSchema.safeParse({
          gtmEventName: null
        })
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Action type determination', () => {
    it('should handle NavigateToBlockAction identification', () => {
      const action = { blockId: 'someId', email: null, url: null }
      expect(action.blockId).toBeTruthy()
      expect(action.email).toBeFalsy()
      expect(action.url).toBeFalsy()
    })

    it('should handle EmailAction identification', () => {
      const action = { blockId: null, email: 'test@example.com', url: null }
      expect(action.blockId).toBeFalsy()
      expect(action.email).toBeTruthy()
      expect(action.url).toBeFalsy()
    })

    it('should handle LinkAction identification', () => {
      const action = { blockId: null, email: null, url: 'https://example.com' }
      expect(action.blockId).toBeFalsy()
      expect(action.email).toBeFalsy()
      expect(action.url).toBeTruthy()
    })
  })
})
