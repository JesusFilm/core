import { ToolInvocationUIPart } from '@ai-sdk/ui-utils'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { RequestFormTool } from './RequestFormTool'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

describe('RequestFormTool', () => {
  const mockAddToolResult = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Field Rendering', () => {
    it('should render text field with all properties', () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'text',
                name: 'title',
                label: 'Title',
                required: true,
                placeholder: 'Enter title here',
                helperText: 'This is a helpful hint',
                suggestion: 'My Journey'
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const textField = screen.getByLabelText('Title')
      expect(textField).toBeInTheDocument()
      expect(textField).toHaveAttribute('placeholder', 'Enter title here')
      expect(textField).toHaveAttribute('aria-label', 'Title')
      expect(textField).toHaveAttribute('tabindex', '0')
      expect(screen.getByText('This is a helpful hint')).toBeInTheDocument()

      const suggestionChip = screen.getByText('My Journey')
      expect(suggestionChip).toBeInTheDocument()
      expect(suggestionChip).toBeInstanceOf(HTMLElement)
    })

    it('should render number field with correct type', () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'number',
                name: 'age',
                label: 'Age',
                required: false,
                helperText: 'Enter your age'
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const numberField = screen.getByLabelText('Age')
      expect(numberField).toBeInTheDocument()
      expect(numberField).toHaveAttribute('type', 'number')
      expect(screen.getByText('Enter your age')).toBeInTheDocument()
    })

    it('should render textarea field with multiline', () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'textarea',
                name: 'description',
                label: 'Description',
                required: true,
                helperText: 'Enter description'
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const textareaField = screen.getByLabelText('Description')
      expect(textareaField).toBeInTheDocument()
      expect(textareaField.tagName.toLowerCase()).toBe('textarea')
    })

    it('should render email field with email type', () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'email',
                name: 'email',
                label: 'Email',
                required: true,
                helperText: 'Enter your email'
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const emailField = screen.getByLabelText('Email')
      expect(emailField).toBeInTheDocument()
      expect(emailField).toHaveAttribute('type', 'email')
    })

    it('should render telephone and URL fields with correct types', () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'tel',
                name: 'phone',
                label: 'Phone',
                required: false,
                helperText: 'Enter phone number'
              },
              {
                type: 'url',
                name: 'website',
                label: 'Website',
                required: false,
                helperText: 'Enter website URL'
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const phoneField = screen.getByLabelText('Phone')
      const urlField = screen.getByLabelText('Website')

      expect(phoneField).toHaveAttribute('type', 'tel')
      expect(urlField).toHaveAttribute('type', 'url')
    })

    it('should render select field with options', () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'select',
                name: 'category',
                label: 'Category',
                required: true,
                helperText: 'Choose a category',
                options: [
                  { label: 'Option 1', value: 'opt1' },
                  { label: 'Option 2', value: 'opt2' }
                ]
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByText('Choose a category')).toBeInTheDocument()

      const selectElement = screen.getByRole('combobox', {
        name: /category/i
      })
      expect(selectElement).toBeInTheDocument()
      expect(selectElement).toHaveAttribute('aria-label', 'Category')
    })

    it('should render checkbox field', () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'checkbox',
                name: 'agree',
                label: 'I agree to terms',
                required: true,
                helperText: 'Check if you agree'
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const checkboxField = screen.getByRole('checkbox', {
        name: 'I agree to terms'
      })
      expect(checkboxField).toBeInTheDocument()
      expect(checkboxField).toHaveAttribute('aria-label', 'I agree to terms')
      expect(checkboxField).toHaveAttribute('tabindex', '0')
      expect(screen.getByText('Check if you agree')).toBeInTheDocument()
    })

    it('should render radio field with options', () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'radio',
                name: 'choice',
                label: 'Choose one',
                required: true,
                helperText: 'Select an option',
                options: [
                  { label: 'Option A', value: 'a' },
                  { label: 'Option B', value: 'b' }
                ]
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      expect(screen.getByText('Choose one')).toBeInTheDocument()
      expect(
        screen.getByRole('radio', { name: 'Option A' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('radio', { name: 'Option B' })
      ).toBeInTheDocument()
      expect(screen.getByText('Select an option')).toBeInTheDocument()
    })
  })

  describe('Form Interactions', () => {
    it('should fill out text field and submit form', async () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'text',
                name: 'title',
                label: 'Title',
                required: true,
                helperText: 'Enter title'
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const textField = screen.getByLabelText('Title')
      const submitButton = screen.getByRole('button', { name: 'Submit form' })

      await userEvent.type(textField, 'My Journey Title')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockAddToolResult).toHaveBeenCalledWith({
          toolCallId: 'test-id',
          result: { title: 'My Journey Title' }
        })
      })
    })

    it('should use suggestion when chip is clicked', async () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'text',
                name: 'title',
                label: 'Title',
                required: true,
                helperText: 'Enter title',
                suggestion: 'Suggested Title'
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const textField = screen.getByLabelText('Title')
      const suggestionChip = screen.getByText('Suggested Title')

      expect(textField).toHaveValue('')

      await userEvent.click(suggestionChip)

      expect(textField).toHaveValue('Suggested Title')
    })

    it('should handle checkbox interaction', async () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'checkbox',
                name: 'agree',
                label: 'I agree',
                required: false,
                helperText: 'Check to agree'
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const checkboxField = screen.getByRole('checkbox', { name: 'I agree' })
      const submitButton = screen.getByRole('button', { name: 'Submit form' })

      await userEvent.click(checkboxField)
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockAddToolResult).toHaveBeenCalledWith({
          toolCallId: 'test-id',
          result: { agree: true }
        })
      })
    })

    it('should handle select field interaction', async () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'select',
                name: 'category',
                label: 'Category',
                required: true,
                helperText: 'Choose category',
                options: [
                  { label: 'Option 1', value: 'opt1' },
                  { label: 'Option 2', value: 'opt2' }
                ]
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const selectField = screen.getByRole('combobox', {
        name: /category/i
      })
      const submitButton = screen.getByRole('button', { name: 'Submit form' })

      await userEvent.click(selectField)
      await userEvent.click(screen.getByRole('option', { name: 'Option 1' }))
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockAddToolResult).toHaveBeenCalledWith({
          toolCallId: 'test-id',
          result: { category: 'opt1' }
        })
      })
    })

    it('should handle radio button interaction', async () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'radio',
                name: 'choice',
                label: 'Choose one',
                required: true,
                helperText: 'Select option',
                options: [
                  { label: 'Option A', value: 'a' },
                  { label: 'Option B', value: 'b' }
                ]
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const radioOption = screen.getByRole('radio', { name: 'Option A' })
      const submitButton = screen.getByRole('button', { name: 'Submit form' })

      await userEvent.click(radioOption)
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockAddToolResult).toHaveBeenCalledWith({
          toolCallId: 'test-id',
          result: { choice: 'a' }
        })
      })
    })

    it('should cancel form and call addToolResult with cancelled result', async () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'text',
                name: 'title',
                label: 'Title',
                required: true,
                helperText: 'Enter title'
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const cancelButton = screen.getByRole('button', { name: 'Cancel form' })
      await userEvent.click(cancelButton)

      expect(mockAddToolResult).toHaveBeenCalledWith({
        toolCallId: 'test-id',
        result: { cancelled: true }
      })
    })

    it('should handle form with multiple mixed field types', async () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'text',
                name: 'title',
                label: 'Title',
                required: true,
                helperText: 'Enter title'
              },
              {
                type: 'checkbox',
                name: 'active',
                label: 'Active',
                required: false,
                helperText: 'Check if active'
              },
              {
                type: 'number',
                name: 'count',
                label: 'Count',
                required: false,
                helperText: 'Enter count'
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const titleField = screen.getByLabelText('Title')
      const activeField = screen.getByRole('checkbox', { name: 'Active' })
      const countField = screen.getByLabelText('Count')
      const submitButton = screen.getByRole('button', { name: 'Submit form' })

      await userEvent.type(titleField, 'Test Title')
      await userEvent.click(activeField)
      await userEvent.type(countField, '42')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockAddToolResult).toHaveBeenCalledWith({
          toolCallId: 'test-id',
          result: {
            title: 'Test Title',
            active: true,
            count: 42
          }
        })
      })
    })
  })

  describe('Validation', () => {
    it('should show required field error when field is empty', async () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'text',
                name: 'title',
                label: 'Title',
                required: true,
                helperText: 'Enter title'
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const textField = screen.getByLabelText('Title')
      const submitButton = screen.getByRole('button', { name: 'Submit form' })

      // Focus and blur to trigger validation
      await userEvent.click(textField)
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Required')).toBeInTheDocument()
      })

      expect(mockAddToolResult).not.toHaveBeenCalled()
    })

    it('should validate email format', async () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'email',
                name: 'email',
                label: 'Email',
                required: true,
                helperText: 'Enter email'
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const emailField = screen.getByLabelText('Email')
      const submitButton = screen.getByRole('button', { name: 'Submit form' })

      await userEvent.type(emailField, 'invalid-email')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument()
      })

      expect(mockAddToolResult).not.toHaveBeenCalled()
    })

    it('should validate URL format', async () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'url',
                name: 'website',
                label: 'Website',
                required: true,
                helperText: 'Enter website'
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const urlField = screen.getByLabelText('Website')
      const submitButton = screen.getByRole('button', { name: 'Submit form' })

      await userEvent.type(urlField, 'not-a-url')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid URL')).toBeInTheDocument()
      })

      expect(mockAddToolResult).not.toHaveBeenCalled()
    })

    it('should validate phone number format', async () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'tel',
                name: 'phone',
                label: 'Phone',
                required: true,
                helperText: 'Enter phone'
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const phoneField = screen.getByLabelText('Phone')
      const submitButton = screen.getByRole('button', { name: 'Submit form' })

      await userEvent.type(phoneField, '123')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid phone number')).toBeInTheDocument()
      })

      expect(mockAddToolResult).not.toHaveBeenCalled()
    })

    it('should clear error when field is corrected', async () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'email',
                name: 'email',
                label: 'Email',
                required: true,
                helperText: 'Enter email'
              }
            ]
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const emailField = screen.getByLabelText('Email')
      const submitButton = screen.getByRole('button', { name: 'Submit form' })

      // Enter invalid email
      await userEvent.type(emailField, 'invalid-email')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument()
      })

      // Clear and enter valid email
      await userEvent.clear(emailField)
      await userEvent.type(emailField, 'valid@email.com')

      // Error should be cleared and submit should work
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.queryByText('Invalid email address')
        ).not.toBeInTheDocument()
        expect(mockAddToolResult).toHaveBeenCalledWith({
          toolCallId: 'test-id',
          result: { email: 'valid@email.com' }
        })
      })
    })
  })

  describe('State Management', () => {
    it('should render result state with submitted values', () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'text',
                name: 'title',
                label: 'Title',
                required: true,
                helperText: 'Enter title'
              },
              {
                type: 'number',
                name: 'count',
                label: 'Count',
                required: false,
                helperText: 'Enter count'
              }
            ]
          },
          state: 'result' as const,
          result: {
            title: 'My Journey',
            count: 42
          }
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      // Should display submitted values in result format
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('My Journey')).toBeInTheDocument()
      expect(screen.getByText('Count')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()

      // Should display in correct order
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(2)
      expect(listItems[0]).toHaveTextContent('Title')
      expect(listItems[0]).toHaveTextContent('My Journey')
      expect(listItems[1]).toHaveTextContent('Count')
      expect(listItems[1]).toHaveTextContent('42')

      // Should not show form elements
      expect(
        screen.queryByRole('button', { name: 'Submit form' })
      ).not.toBeInTheDocument()
    })

    it('should display "Yes"/"No" for checkbox values in result state', () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'checkbox',
                name: 'agree',
                label: 'I agree',
                required: false,
                helperText: 'Check to agree'
              },
              {
                type: 'checkbox',
                name: 'notify',
                label: 'Notify me',
                required: false,
                helperText: 'Check for notifications'
              }
            ]
          },
          state: 'result' as const,
          result: {
            agree: true,
            notify: false
          }
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      expect(screen.getByText('I agree')).toBeInTheDocument()
      expect(screen.getByText('Yes')).toBeInTheDocument()
      expect(screen.getByText('Notify me')).toBeInTheDocument()
      expect(screen.getByText('No')).toBeInTheDocument()

      // Should display in correct order
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(2)
      expect(listItems[0]).toHaveTextContent('I agree')
      expect(listItems[0]).toHaveTextContent('Yes')
      expect(listItems[1]).toHaveTextContent('Notify me')
      expect(listItems[1]).toHaveTextContent('No')
    })

    it('should display "—" for empty/null values in result state', () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'text',
                name: 'title',
                label: 'Title',
                required: false,
                helperText: 'Enter title'
              },
              {
                type: 'text',
                name: 'description',
                label: 'Description',
                required: false,
                helperText: 'Enter description'
              }
            ]
          },
          state: 'result' as const,
          result: {
            title: '',
            description: null
          }
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      const emptyValueElements = screen.getAllByText('—')
      expect(emptyValueElements).toHaveLength(2)

      // Should display in correct order
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(2)
      expect(listItems[0]).toHaveTextContent('Title')
      expect(listItems[0]).toHaveTextContent('—')
      expect(listItems[1]).toHaveTextContent('Description')
      expect(listItems[1]).toHaveTextContent('—')
    })

    it('should show cancellation message when form was cancelled', () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'text',
                name: 'title',
                label: 'Title',
                required: true,
                helperText: 'Enter title'
              }
            ]
          },
          state: 'result' as const,
          result: {
            cancelled: true
          }
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      expect(screen.getByText('Form was cancelled')).toBeInTheDocument()
      expect(screen.queryByText('Title')).not.toBeInTheDocument()
    })

    it('should return null for unknown state', () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: [
              {
                type: 'text',
                name: 'title',
                label: 'Title',
                required: true,
                helperText: 'Enter title'
              }
            ]
          },
          state: 'unknown' as any
        }
      } as ToolInvocationUIPart

      const { container } = render(
        <RequestFormTool part={part} addToolResult={mockAddToolResult} />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty formItems array', () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {
            formItems: []
          },
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      // Should still render submit and cancel buttons
      expect(
        screen.getByRole('button', { name: 'Submit form' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Cancel form' })
      ).toBeInTheDocument()
    })

    it('should handle missing formItems in args', () => {
      const part = {
        type: 'tool-invocation' as const,
        toolInvocation: {
          toolCallId: 'test-id',
          toolName: 'clientRequestForm',
          args: {},
          state: 'call' as const
        }
      } as ToolInvocationUIPart

      render(<RequestFormTool part={part} addToolResult={mockAddToolResult} />)

      // Should still render submit and cancel buttons
      expect(
        screen.getByRole('button', { name: 'Submit form' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Cancel form' })
      ).toBeInTheDocument()
    })
  })
})
