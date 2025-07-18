import { z } from 'zod'

import { clientRedirectUserToEditor } from './redirectUserToEditor'

describe('clientRedirectUserToEditor', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return a tool with correct description, parameters, and descriptions', () => {
    const tool = clientRedirectUserToEditor()

    expect(tool.description).toBe('Redirect the user to the editor.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)

    const parametersShape = tool.parameters.shape as {
      message: z.ZodTypeAny
      journeyId: z.ZodTypeAny
    }

    // Test parameter types
    expect(parametersShape.message).toBeInstanceOf(z.ZodString)
    expect(parametersShape.journeyId).toBeInstanceOf(z.ZodString)

    // Test parameter descriptions
    expect(parametersShape.message.description).toBe(
      'The message to let the user know they can see their journey by clicking the button below and inform them it takes them to the editor.'
    )
    expect(parametersShape.journeyId.description).toBe(
      'The id of the journey to redirect to.'
    )
  })

  it('should validate correct input successfully', () => {
    const tool = clientRedirectUserToEditor()
    const input = {
      message: 'Click below to see your journey in the editor',
      journeyId: 'journey-456'
    }

    const result = tool.parameters.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('should fail validation if required fields are missing', () => {
    const tool = clientRedirectUserToEditor()
    const input = {}

    const result = tool.parameters.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issues = result.error.issues.map((i) => i.path[0])
      expect(issues).toContain('message')
      expect(issues).toContain('journeyId')
    }
  })

  it('should fail validation when message is not a string', () => {
    const tool = clientRedirectUserToEditor()
    const input = {
      message: true,
      journeyId: 'journey-456'
    }

    const result = tool.parameters.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issues = result.error.issues.map((i) => i.path[0])
      expect(issues).toContain('message')
    }
  })

  it('should fail validation when journeyId is not a string', () => {
    const tool = clientRedirectUserToEditor()
    const input = {
      message: 'Click below to see your journey',
      journeyId: null
    }

    const result = tool.parameters.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issues = result.error.issues.map((i) => i.path[0])
      expect(issues).toContain('journeyId')
    }
  })
})
