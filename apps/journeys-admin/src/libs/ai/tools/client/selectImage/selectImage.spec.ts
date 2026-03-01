import { z } from 'zod'

import { clientSelectImage } from './selectImage'

describe('clientSelectImage', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return a tool with correct description, inputSchema, and descriptions', () => {
    const tool = clientSelectImage()

    expect(tool.description).toBe('Ask the user for confirmation on an image.')
    expect(tool.inputSchema).toBeInstanceOf(z.ZodObject)

    const inputSchemaShape = tool.inputSchema.shape as {
      message: z.ZodTypeAny
      imageId: z.ZodTypeAny
      generatedImageUrls: z.ZodTypeAny
    }

    expect(inputSchemaShape.message).toBeInstanceOf(z.ZodString)
    expect(inputSchemaShape.imageId).toBeInstanceOf(z.ZodString)
    expect(inputSchemaShape.generatedImageUrls).toBeInstanceOf(z.ZodOptional)

    expect(inputSchemaShape.message.description).toBe(
      'The message to ask for confirmation.'
    )
    expect(inputSchemaShape.imageId.description).toBe(
      'The id of the image to select.'
    )
    expect(inputSchemaShape.generatedImageUrls.description).toBe(
      'The urls of the generated images. Pass result from AgentGenerateImage tool.'
    )
  })

  it('should validate correct input successfully', () => {
    const tool = clientSelectImage()
    const input = {
      message: 'Do you want this image?',
      imageId: 'img-123',
      generatedImageUrls: ['https://example.com/image.png']
    }

    const result = tool.inputSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('should fail validation if required fields are missing', () => {
    const tool = clientSelectImage()
    const input = {
      generatedImageUrls: ['https://example.com/image.png']
    }

    const result = tool.inputSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issues = result.error.issues.map((i) => i.path[0])
      expect(issues).toContain('message')
      expect(issues).toContain('imageId')
    }
  })

  it('should allow undefined or omitted generatedImageUrls', () => {
    const tool = clientSelectImage()
    const input = {
      message: 'Select this image?',
      imageId: 'img-abc'
    }

    const result = tool.inputSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('should fail validation when generatedImageUrls is not an array', () => {
    const tool = clientSelectImage()
    const input = {
      message: 'Select this image?',
      imageId: 'img-123',
      generatedImageUrls: 'not-an-array'
    }

    const result = tool.inputSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issues = result.error.issues.map((i) => i.path[0])
      expect(issues).toContain('generatedImageUrls')
    }
  })
})
