import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { RadioOptionFields } from '../../../../../../../../__generated__/RadioOptionFields'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { RADIO_OPTION_BLOCK_UPDATE_CONTENT, RadioOptionEdit } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('RadioOptionEdit', () => {
  const props: TreeBlock<RadioOptionFields> = {
    __typename: 'RadioOptionBlock',
    id: 'option.id',
    label: 'test label',
    parentBlockId: 'card',
    parentOrder: 0,
    action: null,
    children: []
  }

  it('selects the input on click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <RadioOptionEdit {...props} />
      </MockedProvider>
    )
    const input = getByRole('textbox')
    fireEvent.click(input)
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('placeholder', 'Type your text here...')
  })

  it('saves the option label on onBlur', async () => {
    const result = jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
            label: 'updated label'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'option.id',
                input: {
                  label: 'updated label'
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider>
          <RadioOptionEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '    updated label    ' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should not save if label hasnt changed', async () => {
    const result = jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
            label: 'test label'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'option.id',
                input: {
                  label: 'test label'
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider>
          <RadioOptionEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox', { name: '' })
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'test label' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('saves the option label on outside click', async () => {
    const result = jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
            label: 'updated label'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'option.id',
                input: {
                  label: 'updated label'
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider>
          <h1 className="EditorCanvas" />
          <iframe>
            <RadioOptionEdit {...props} />
          </iframe>
        </EditorProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '    updated label    ' } })
    fireEvent.click(getByRole('heading', { level: 1 }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should clear label if Option 1 or Option 2', () => {
    const args = {
      ...props,
      label: 'Option 1'
    }
    const { getByRole } = render(
      <MockedProvider>
        <RadioOptionEdit {...args} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: '' })).toBeInTheDocument()
  })

  it('should undo the label change', async () => {
    const result1 = jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
            label: 'updated label more'
          }
        ]
      }
    }))

    const result2 = jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
            label: 'test label'
          }
        ]
      }
    }))

    const mockUpdateSuccess1 = {
      request: {
        query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
        variables: {
          id: 'option.id',
          input: {
            label: 'updated label more'
          }
        }
      },
      result: result1
    }

    const mockUpdateSuccess2 = {
      request: {
        query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
        variables: {
          id: 'option.id',
          input: {
            label: 'test label'
          }
        }
      },
      result: result2
    }

    render(
      <MockedProvider mocks={[mockUpdateSuccess1, mockUpdateSuccess2]}>
        <EditorProvider>
          <CommandUndoItem variant="button" />
          <RadioOptionEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'updated label more' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result1).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should redo the change to label that was undone', async () => {
    const result1 = jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
            label: 'updated label more'
          }
        ]
      }
    }))

    const result2 = jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
            label: 'test label'
          }
        ]
      }
    }))

    const mockUpdateSuccess1 = {
      request: {
        query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
        variables: {
          id: 'option.id',
          input: {
            label: 'updated label more'
          }
        }
      },
      result: result1,
      maxUsageCount: 2
    }

    const mockUpdateSuccess2 = {
      request: {
        query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
        variables: {
          id: 'option.id',
          input: {
            label: 'test label'
          }
        }
      },
      result: result2
    }

    render(
      <MockedProvider mocks={[mockUpdateSuccess1, mockUpdateSuccess2]}>
        <EditorProvider>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <RadioOptionEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'updated label more' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result1).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(result1).toHaveBeenCalled())
  })
})
