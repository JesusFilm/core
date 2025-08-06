import { z } from 'zod'

import { clientRequestForm, formItemSchema } from './requestForm'

describe('RequestForm', () => {
  describe('clientRequestForm', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should return a tool with correct description, parameters, and descriptions', () => {
      const tool = clientRequestForm()

      expect(tool.description).toBe('Ask the user to fill out a form.')
      expect(tool.parameters).toBeInstanceOf(z.ZodObject)

      const parametersShape = tool.parameters.shape

      expect(parametersShape.formItems).toBeInstanceOf(z.ZodArray)
      expect(parametersShape.formItems._def.type).toBe(formItemSchema)

      expect(parametersShape.formItems.description).toBe(
        'Array of form items to be filled out by the user.'
      )
    })

    it('should validate correct input successfully', () => {
      const tool = clientRequestForm()
      const input = {
        formItems: [
          {
            type: 'text',
            name: 'organizationName',
            label: 'Organization Name',
            required: true,
            placeholder: 'Enter your organization name',
            helperText: 'The name of your church or ministry'
          },
          {
            type: 'select',
            name: 'eventType',
            label: 'Event Type',
            required: false,
            helperText: 'What type of event is this?',
            options: [
              { label: 'Conference', value: 'conference' },
              { label: 'Workshop', value: 'workshop' }
            ]
          }
        ]
      }

      const result = tool.parameters.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('should fail validation if formItems is missing', () => {
      const tool = clientRequestForm()
      const input = {}

      const result = tool.parameters.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = result.error.issues.map((i) => i.path[0])
        expect(issues).toContain('formItems')
      }
    })

    it('should fail validation when formItems is not an array', () => {
      const tool = clientRequestForm()
      const input = {
        formItems: 'not-an-array'
      }

      const result = tool.parameters.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = result.error.issues.map((i) => i.path[0])
        expect(issues).toContain('formItems')
      }
    })

    it('should fail validation for invalid form item structure', () => {
      const tool = clientRequestForm()
      const input = {
        formItems: [
          {
            // Missing required fields: type, name, label, helperText
            placeholder: 'Some placeholder'
          }
        ]
      }

      const result = tool.parameters.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = result.error.issues.map((i) => i.path.join('.'))
        expect(issues.some((issue) => issue.includes('type'))).toBe(true)
        expect(issues.some((issue) => issue.includes('name'))).toBe(true)
        expect(issues.some((issue) => issue.includes('label'))).toBe(true)
        expect(issues.some((issue) => issue.includes('helperText'))).toBe(true)
      }
    })

    it('should validate form item with all optional fields', () => {
      const tool = clientRequestForm()
      const input = {
        formItems: [
          {
            type: 'select',
            name: 'contactEmail',
            label: 'Contact Email',
            required: true,
            placeholder: 'contact@example.com',
            suggestion: 'admin@church.org',
            helperText: 'Primary contact email for your organization',
            options: [
              { label: 'Work Email', value: 'work@church.org' },
              { label: 'Admin Email', value: 'admin@church.org' }
            ]
          }
        ]
      }

      const result = tool.parameters.safeParse(input)
      expect(result.success).toBe(true)
    })
  })

  describe('formItemSchema', () => {
    it('should validate a minimal form item', () => {
      const input = {
        type: 'text',
        name: 'testField',
        label: 'Test Field',
        helperText: 'This is a test field'
      }

      const result = formItemSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('should fail validation for invalid form item type', () => {
      const input = {
        type: 'invalid-type',
        name: 'testField',
        label: 'Test Field',
        helperText: 'This is a test field'
      }

      const result = formItemSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        const issues = result.error.issues.map((i) => i.path[0])
        expect(issues).toContain('type')
      }
    })

    it('should validate form item with options for select type', () => {
      const input = {
        type: 'select',
        name: 'category',
        label: 'Category',
        helperText: 'Select a category',
        options: [
          { label: 'Option 1', value: 'opt1' },
          { label: 'Option 2', value: 'opt2' }
        ]
      }

      const result = formItemSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })
})
