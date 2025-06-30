import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { ButtonSize } from '../../../../../../../../../../__generated__/globalTypes'
import { CommandRedoItem } from '../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { BUTTON_BLOCK_UPDATE } from './Size'

import { Size } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Button size selector', () => {
  const selectedBlock: TreeBlock<ButtonBlock> = {
    __typename: 'ButtonBlock',
    id: 'id',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    label: 'test button',
    buttonVariant: null,
    buttonColor: null,
    size: ButtonSize.medium,
    startIconId: null,
    endIconId: null,
    submitEnabled: null,
    action: null,
    children: []
  }

  const sizeUpdateMock = {
    request: {
      query: BUTTON_BLOCK_UPDATE,
      variables: {
        id: 'id',
        size: ButtonSize.small
      }
    },
    result: jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          size: ButtonSize.small
        }
      }
    }))
  }

  const sizeUpdateMock2 = {
    request: {
      query: BUTTON_BLOCK_UPDATE,
      variables: {
        id: 'id',
        size: ButtonSize.medium
      }
    },
    result: jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          size: ButtonSize.medium
        }
      }
    }))
  }

  beforeEach(() => jest.clearAllMocks())

  it('should show button size properties', () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Size />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Small' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Medium' })).toHaveClass(
      'Mui-selected'
    )
    expect(screen.getByRole('button', { name: 'Large' })).toBeInTheDocument()
  })

  it('should change the size property', async () => {
    render(
      <MockedProvider mocks={[sizeUpdateMock]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <Size />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByRole('button', { name: 'Medium' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Small' }))
    await waitFor(() => expect(sizeUpdateMock.result).toHaveBeenCalled())
  })

  it('should undo the size change', async () => {
    render(
      <MockedProvider mocks={[sizeUpdateMock, sizeUpdateMock2]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <Size />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByRole('button', { name: 'Medium' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Small' }))
    await waitFor(() => expect(sizeUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(sizeUpdateMock2.result).toHaveBeenCalled())
  })

  it('should redo the undone size change', async () => {
    const mockFirstUpdate = {
      ...sizeUpdateMock,
      maxUsageCount: 2
    }

    render(
      <MockedProvider mocks={[mockFirstUpdate, sizeUpdateMock2]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <Size />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByRole('button', { name: 'Medium' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Small' }))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(sizeUpdateMock2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())
  })

  it('should not call mutation when no selected block', async () => {
    render(
      <MockedProvider mocks={[sizeUpdateMock]}>
        <EditorProvider initialState={{}}>
          <Size />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByRole('button', { name: 'Medium' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Small' }))
    await waitFor(() => expect(sizeUpdateMock.result).not.toHaveBeenCalled())
  })
})
