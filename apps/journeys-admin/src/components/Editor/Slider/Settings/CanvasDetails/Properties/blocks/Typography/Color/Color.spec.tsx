import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { TYPOGRAPHY_BLOCK_UPDATE_COLOR } from './Color'

import { Color } from '.'

describe('Typography color selector', () => {
  it('should show typography color picker components', () => {
    const selectedBlock: TreeBlock<TypographyBlock> = {
      __typename: 'TypographyBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      align: null,
      color: null,
      content: '',
      variant: null,
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      },
      children: []
    }
    const { getByTestId, getByRole } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Color />
        </EditorProvider>
      </MockedProvider>
    )

    // Should show the color swatch with default color (matches actual display behavior)
    expect(getByTestId('Swatch-typography-color-#FEFEFE')).toBeInTheDocument()
    expect(getByTestId('Swatch-typography-color-#FEFEFE')).toHaveStyle({
      backgroundColor: '#FEFEFE'
    })

    // Should show the text input with the current color
    expect(getByRole('textbox')).toHaveValue('#FEFEFE')

    // Should show the color picker
    expect(getByTestId('typographyColorPicker')).toBeInTheDocument()
  })

  it('should show the selected color in UI components', () => {
    const selectedBlock: TreeBlock<TypographyBlock> = {
      __typename: 'TypographyBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      align: null,
      color: null,
      content: '',
      variant: null,
      settings: {
        __typename: 'TypographyBlockSettings',
        color: '#B62D1C'
      },
      children: []
    }
    const { getByTestId, getByRole } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Color />
        </EditorProvider>
      </MockedProvider>
    )

    // Should show the correct color swatch
    expect(getByTestId('Swatch-typography-color-#B62D1C')).toBeInTheDocument()
    expect(getByTestId('Swatch-typography-color-#B62D1C')).toHaveStyle({
      backgroundColor: '#B62D1C'
    })

    // Should show the correct color in text input
    expect(getByRole('textbox')).toHaveValue('#B62D1C')
  })

  it('should update color via text input', async () => {
    const selectedBlock: TreeBlock<TypographyBlock> = {
      __typename: 'TypographyBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      align: null,
      color: null,
      content: '',
      variant: null,
      settings: {
        __typename: 'TypographyBlockSettings',
        color: '#C52D3A'
      },
      children: []
    }
    const result = jest.fn(() => ({
      data: {
        typographyBlockUpdate: {
          id: 'id',
          settings: {
            color: '#444451',
            __typename: 'TypographyBlockSettings'
          },
          __typename: 'TypographyBlock'
        }
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_COLOR,
              variables: {
                id: 'id',
                settings: { color: '#444451' }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Color />
        </EditorProvider>
      </MockedProvider>
    )

    const textInput = getByRole('textbox')
    fireEvent.change(textInput, { target: { value: '#444451' } })
    fireEvent.blur(textInput)

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should undo the color change', async () => {
    const selectedBlock: TreeBlock<TypographyBlock> = {
      __typename: 'TypographyBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      align: null,
      color: null,
      content: '',
      variant: null,
      settings: {
        __typename: 'TypographyBlockSettings',
        color: '#B62D1C'
      },
      children: []
    }
    const result1 = jest.fn(() => ({
      data: {
        typographyBlockUpdate: {
          id: 'id',
          settings: {
            color: '#444451',
            __typename: 'TypographyBlockSettings'
          },
          __typename: 'TypographyBlock'
        }
      }
    }))
    const result2 = jest.fn(() => ({
      data: {
        typographyBlockUpdate: {
          id: 'id',
          settings: {
            color: '#B62D1C',
            __typename: 'TypographyBlockSettings'
          },
          __typename: 'TypographyBlock'
        }
      }
    }))
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_COLOR,
              variables: {
                id: 'id',
                settings: { color: '#444451' }
              }
            },
            result: result1
          },
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_COLOR,
              variables: {
                id: 'id',
                settings: { color: '#B62D1C' }
              }
            },
            result: result2
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <Color />
        </EditorProvider>
      </MockedProvider>
    )

    const textInput = screen.getByRole('textbox')
    fireEvent.change(textInput, { target: { value: '#444451' } })
    fireEvent.blur(textInput)
    await waitFor(() => expect(result1).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })
})
