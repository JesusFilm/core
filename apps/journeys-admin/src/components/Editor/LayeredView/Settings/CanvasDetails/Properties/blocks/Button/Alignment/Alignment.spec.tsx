import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { ButtonAlignment } from '../../../../../../../../../../__generated__/globalTypes'
import { CommandRedoItem } from '../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { BUTTON_BLOCK_UPDATE } from './Alignment'

import { Alignment } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Button alignment selector', () => {
  const selectedBlock: TreeBlock<ButtonBlock> = {
    __typename: 'ButtonBlock',
    id: 'id',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    label: 'test button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    submitEnabled: null,
    action: null,
    settings: {
      __typename: 'ButtonBlockSettings',
      alignment: ButtonAlignment.justify
    },
    children: []
  }

  const alignmentUpdateMock = {
    request: {
      query: BUTTON_BLOCK_UPDATE,
      variables: {
        id: 'id',
        settings: {
          alignment: ButtonAlignment.left
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          settings: {
            alignment: ButtonAlignment.left
          }
        }
      }
    }))
  }

  const alignmentUpdateMock2 = {
    request: {
      query: BUTTON_BLOCK_UPDATE,
      variables: {
        id: 'id',
        settings: {
          alignment: ButtonAlignment.justify
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          settings: {
            alignment: ButtonAlignment.justify
          }
        }
      }
    }))
  }

  beforeEach(() => jest.clearAllMocks())

  it('should show button alignment properties', () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Alignment />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByLabelText('Align Left')).toBeInTheDocument()
    expect(screen.getByLabelText('Align Center')).toBeInTheDocument()
    expect(screen.getByLabelText('Align Right')).toBeInTheDocument()
    expect(screen.getByLabelText('Align Justify')).toHaveClass('Mui-selected')
  })

  it('should change the alignment property', async () => {
    render(
      <MockedProvider mocks={[alignmentUpdateMock]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <Alignment />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByLabelText('Align Left'))
    await waitFor(() => expect(alignmentUpdateMock.result).toHaveBeenCalled())
  })

  it('should undo the alignment change', async () => {
    render(
      <MockedProvider mocks={[alignmentUpdateMock, alignmentUpdateMock2]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <Alignment />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByLabelText('Align Left'))
    await waitFor(() => expect(alignmentUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(alignmentUpdateMock2.result).toHaveBeenCalled())
  })

  it('should redo the undone alignment change', async () => {
    const mockFirstUpdate = {
      ...alignmentUpdateMock,
      maxUsageCount: 2
    }

    render(
      <MockedProvider mocks={[mockFirstUpdate, alignmentUpdateMock2]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <Alignment />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByLabelText('Align Left'))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(alignmentUpdateMock2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())
  })

  it('should display current alignment from selectedBlock', () => {
    const blockWithLeftAlignment = {
      ...selectedBlock,
      settings: {
        __typename: 'ButtonBlockSettings' as const,
        alignment: ButtonAlignment.left
      }
    }

    render(
      <MockedProvider>
        <EditorProvider
          initialState={{ selectedBlock: blockWithLeftAlignment }}
        >
          <Alignment />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByLabelText('Align Left')).toHaveClass('Mui-selected')
  })

  it('should default to justify alignment when no alignment is set', () => {
    const blockWithoutAlignment = {
      ...selectedBlock,
      settings: {
        __typename: 'ButtonBlockSettings' as const,
        alignment: null
      }
    }

    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock: blockWithoutAlignment }}>
          <Alignment />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByLabelText('Align Justify')).toHaveClass('Mui-selected')
  })
})
