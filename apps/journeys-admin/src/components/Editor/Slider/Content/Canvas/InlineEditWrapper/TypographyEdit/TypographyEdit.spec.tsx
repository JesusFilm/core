import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentProps } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { TypographyVariant } from '../../../../../../../../__generated__/globalTypes'

import { TYPOGRAPHY_BLOCK_UPDATE_CONTENT, TypographyEdit } from '.'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TypographyEdit', () => {
  const props: ComponentProps<typeof TypographyEdit> = {
    __typename: 'TypographyBlock',
    parentBlockId: 'card.id',
    parentOrder: 0,
    id: 'typography.id',
    variant: TypographyVariant.body1,
    content: 'test content',
    align: null,
    color: null,
    children: []
  }

  it('selects the input on click', () => {
    render(
      <MockedProvider>
        <TypographyEdit {...props} />
      </MockedProvider>
    )
    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('placeholder', 'Add your text here...')
  })

  it('should not call updateContent if the content is not changed', async () => {
    const result = jest.fn(() => ({
      data: {
        typographyBlockUpdate: [
          {
            __typename: 'TypographyBlock',
            id: 'typography.id',
            content: 'test content'
          }
        ]
      }
    }))

    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'typography.id',
                input: {
                  content: 'test content'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider>
            <TypographyEdit {...props} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByText('test content'))
    fireEvent.change(getByText('test content'), {
      target: { value: 'test content' }
    })
    fireEvent.blur(getByText('test content'))
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('persists selection state on outside click', async () => {
    const result = jest.fn(() => ({
      data: {
        typographyBlockUpdate: [
          {
            __typename: 'TypographyBlock',
            id: 'typography.id',
            content: 'updated content'
          }
        ]
      }
    }))
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'typography.id',
                journeyId: 'journeyId',
                input: {
                  content: 'new'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <h1>Other content</h1>
          <TypographyEdit {...props} />
        </JourneyProvider>
      </MockedProvider>
    )
    const input = screen.getByRole('textbox')

    await userEvent.click(input)
    // All text selected on first focus
    expect(input).toHaveValue(props.content)
    await userEvent.clear(input)
    expect(input).toHaveValue('')

    // Cursor remains at end of input after outside click
    await userEvent.type(input, 'new')
    await userEvent.click(screen.getByRole('heading', { level: 1 }))
    await userEvent.type(input, '{backspace}')
    expect(input).toHaveValue('ne')
  })

  it('should undo the typography content change', async () => {
    const result1 = jest.fn(() => ({
      data: {
        typographyBlockUpdate: [
          {
            __typename: 'TypographyBlock',
            id: 'typography.id',
            content: 'new'
          }
        ]
      }
    }))

    const result2 = jest.fn(() => ({
      data: {
        typographyBlockUpdate: [
          {
            __typename: 'TypographyBlock',
            id: 'typography.id',
            content: 'test content'
          }
        ]
      }
    }))

    const mockUpdateSuccess1 = {
      request: {
        query: TYPOGRAPHY_BLOCK_UPDATE_CONTENT,
        variables: {
          id: 'typography.id',
          content: 'new'
        }
      },
      result: result1
    }

    const mockUpdateSuccess2 = {
      request: {
        query: TYPOGRAPHY_BLOCK_UPDATE_CONTENT,
        variables: {
          id: 'typography.id',
          content: 'test content'
        }
      },
      result: result2
    }

    render(
      <MockedProvider mocks={[mockUpdateSuccess1, mockUpdateSuccess2]}>
        <EditorProvider>
          <CommandUndoItem variant="button" />
          <TypographyEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'new' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result1).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should redo the typography content change', async () => {
    const result1 = jest.fn(() => ({
      data: {
        typographyBlockUpdate: [
          {
            __typename: 'TypographyBlock',
            id: 'typography.id',
            content: 'new'
          }
        ]
      }
    }))

    const result2 = jest.fn(() => ({
      data: {
        typographyBlockUpdate: [
          {
            __typename: 'TypographyBlock',
            id: 'typography.id',
            content: 'test content'
          }
        ]
      }
    }))

    const mockUpdateSuccess1 = {
      request: {
        query: TYPOGRAPHY_BLOCK_UPDATE_CONTENT,
        variables: {
          id: 'typography.id',
          content: 'new'
        }
      },
      result: result1,
      maxUsageCount: 2
    }

    const mockUpdateSuccess2 = {
      request: {
        query: TYPOGRAPHY_BLOCK_UPDATE_CONTENT,
        variables: {
          id: 'typography.id',
          content: 'test content'
        }
      },
      result: result2
    }

    render(
      <MockedProvider mocks={[mockUpdateSuccess1, mockUpdateSuccess2]}>
        <EditorProvider>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <TypographyEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'new' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result1).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(result1).toHaveBeenCalled())
  })
})
