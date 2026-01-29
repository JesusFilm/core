import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { ButtonVariant } from '../../../../../../../../../../__generated__/globalTypes'
import { CommandRedoItem } from '../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { BUTTON_BLOCK_UPDATE } from './Variant'

import { Variant } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Button variant selector', () => {
  const selectedBlock: TreeBlock<ButtonBlock> = {
    __typename: 'ButtonBlock',
    id: 'id',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    label: 'test button',
    buttonVariant: ButtonVariant.contained,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    submitEnabled: null,
    action: null,
    children: [],
    settings: null
  }

  const variantUpdateMock = {
    request: {
      query: BUTTON_BLOCK_UPDATE,
      variables: {
        id: 'id',
        variant: ButtonVariant.text
      }
    },
    result: jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          variant: ButtonVariant.text
        }
      }
    }))
  }

  const variantUpdateMock2 = {
    request: {
      query: BUTTON_BLOCK_UPDATE,
      variables: {
        id: 'id',
        variant: ButtonVariant.contained
      }
    },
    result: jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          variant: ButtonVariant.contained
        }
      }
    }))
  }

  beforeEach(() => jest.clearAllMocks())

  it('should show button variant properties', () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Variant />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Text' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Contained' })).toHaveClass(
      'Mui-selected'
    )
  })

  it('should change the Variant property', async () => {
    render(
      <MockedProvider mocks={[variantUpdateMock]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <Variant />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByRole('button', { name: 'Contained' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Text' }))
    await waitFor(() => expect(variantUpdateMock.result).toHaveBeenCalled())
  })

  it('should undo the variant change', async () => {
    render(
      <MockedProvider mocks={[variantUpdateMock, variantUpdateMock2]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <Variant />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByRole('button', { name: 'Contained' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Text' }))
    await waitFor(() => expect(variantUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(variantUpdateMock2.result).toHaveBeenCalled())
  })

  it('should redo the undone variant change', async () => {
    const mockFirstUpdate = {
      ...variantUpdateMock,
      maxUsageCount: 2
    }
    render(
      <MockedProvider mocks={[mockFirstUpdate, variantUpdateMock2]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <Variant />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByRole('button', { name: 'Contained' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Text' }))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(variantUpdateMock2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())
  })

  it('should not call mutation if no selected block', async () => {
    render(
      <MockedProvider mocks={[variantUpdateMock]}>
        <EditorProvider initialState={{}}>
          <Variant />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByRole('button', { name: 'Contained' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Text' }))
    await waitFor(() => expect(variantUpdateMock.result).not.toHaveBeenCalled())
  })
})
