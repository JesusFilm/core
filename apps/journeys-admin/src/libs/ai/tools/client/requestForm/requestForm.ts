import { Tool, tool } from 'ai'
import { z } from 'zod'

export const formItemSchema = z.object({
  type: z
    .enum([
      'text',
      'number',
      'select',
      'checkbox',
      'radio',
      'textarea',
      'email',
      'tel',
      'url'
    ])
    .describe('The type of the form field.'),
  name: z.string().describe('The unique name/key for the form field.'),
  label: z
    .string()
    .describe(
      'The label to display for the form field. Label should be a short name for the field.'
    ),
  required: z.boolean().optional().describe('Whether the field is required.'),
  placeholder: z
    .string()
    .optional()
    .describe(
      'Placeholder text for the field. Placeholder must be less than 80 characters.'
    ),
  suggestion: z
    .string()
    .optional()
    .describe(
      'A suggested value for the field, if the AI thinks it might know the answer.'
    ),
  helperText: z
    .string()
    .describe('Helper text to show below the field for additional guidance.'),
  options: z
    .array(
      z.object({
        label: z.string().describe('The label for the option.'),
        value: z.string().describe('The value for the option.')
      })
    )
    .optional()
    .describe('Options for select, radio, or checkbox fields.')
  // Validation rules for specific types (for documentation, not enforced here)
  // Actual validation will be handled in the UI using Zod
})

export function clientRequestForm(): Tool {
  return tool({
    description: 'Ask the user to fill out a form.',
    parameters: z.object({
      formItems: z
        .array(formItemSchema)
        .describe('Array of form items to be filled out by the user.')
    })
  })
}
