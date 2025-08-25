import { z } from 'zod'

import { clientSelectVideo } from './selectVideo'

describe('clientSelectVideo', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return a tool with correct description, parameters, and descriptions', () => {
    const tool = clientSelectVideo()

    expect(tool.description).toBe('Ask the user for confirmation on a video.')
    expect(tool.parameters).toBeInstanceOf(z.ZodObject)

    const parametersShape = tool.parameters.shape as {
      message: z.ZodTypeAny
      videoId: z.ZodTypeAny
    }

    // Test parameter types
    expect(parametersShape.message).toBeInstanceOf(z.ZodString)
    expect(parametersShape.videoId).toBeInstanceOf(z.ZodString)

    // Test parameter descriptions
    expect(parametersShape.message.description).toBe(
      'The message to ask for confirmation.'
    )
    expect(parametersShape.videoId.description).toBe(
      'The id of the video to select.'
    )
  })

  it('should validate correct input successfully', () => {
    const tool = clientSelectVideo()
    const input = {
      message: 'Do you want this video?',
      videoId: 'video-123'
    }

    const result = tool.parameters.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('should fail validation if required fields are missing', () => {
    const tool = clientSelectVideo()
    const input = {}

    const result = tool.parameters.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issues = result.error.issues.map((i) => i.path[0])
      expect(issues).toContain('message')
      expect(issues).toContain('videoId')
    }
  })

  it('should fail validation when message is not a string', () => {
    const tool = clientSelectVideo()
    const input = {
      message: 123,
      videoId: 'video-123'
    }

    const result = tool.parameters.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issues = result.error.issues.map((i) => i.path[0])
      expect(issues).toContain('message')
    }
  })

  it('should fail validation when videoId is not a string', () => {
    const tool = clientSelectVideo()
    const input = {
      message: 'Select this video?',
      videoId: 456
    }

    const result = tool.parameters.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issues = result.error.issues.map((i) => i.path[0])
      expect(issues).toContain('videoId')
    }
  })
})
