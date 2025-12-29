import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import type { TreeBlock } from '@core/journeys/ui/block'
import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  BlockOrderUpdate,
  BlockOrderUpdateVariables
} from '../../../../../../../../__generated__/BlockOrderUpdate'
import { blockOrderUpdateMock } from '../../../../../../../libs/useBlockOrderUpdateMutation/useBlockOrderUpdateMutation.mock'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { MoveBlock } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('MoveBlockButton', () => {
  const block1: TreeBlock = {
    id: 'typographyBlockId1',
    __typename: 'TypographyBlock',
    parentBlockId: 'card0.id',
    parentOrder: 0,
    align: null,
    color: null,
    content: 'Text1',
    variant: null,
    children: [],
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
  }

  const block2: TreeBlock = {
    id: 'typographyBlockId2',
    __typename: 'TypographyBlock',
    parentBlockId: 'card0.id',
    parentOrder: 1,
    align: null,
    color: null,
    content: 'Text2',
    variant: null,
    children: [],
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
  }

  const block3: TreeBlock = {
    id: 'typographyBlockId3',
    __typename: 'TypographyBlock',
    parentBlockId: 'card0.id',
    parentOrder: null,
    align: null,
    color: null,
    content: 'Text2',
    variant: null,
    children: [],
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
  }

  const card: TreeBlock = {
    id: 'card0.id',
    __typename: 'CardBlock',
    parentBlockId: 'step0.id',
    parentOrder: 0,
    coverBlockId: null,
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false,
    backdropBlur: null,
    children: [block1, block2]
  }

  const step: TreeBlock = {
    __typename: 'StepBlock',
    id: 'step0.id',
    parentBlockId: null,
    parentOrder: 0,
    locked: true,
    nextBlockId: null,
    slug: null,
    children: [card]
  }

  const mockBlockOrderFirstMock: MockedResponse<
    BlockOrderUpdate,
    BlockOrderUpdateVariables
  > = {
    request: {
      ...blockOrderUpdateMock.request,
      variables: {
        id: 'typographyBlockId2',
        parentOrder: 0
      }
    },
    result: {
      data: {
        blockOrderUpdate: [
          {
            __typename: 'TypographyBlock',
            id: 'typographyBlockId2',
            parentOrder: 0
          },
          {
            __typename: 'TypographyBlock',
            id: 'typographyBlockId1',
            parentOrder: 1
          }
        ]
      }
    }
  }
  const mockBlockOrderLastMock: MockedResponse<
    BlockOrderUpdate,
    BlockOrderUpdateVariables
  > = {
    request: {
      ...blockOrderUpdateMock.request,
      variables: {
        id: 'typographyBlockId2',
        parentOrder: 1
      }
    },
    result: {
      data: {
        blockOrderUpdate: [
          {
            __typename: 'TypographyBlock',
            id: 'typographyBlockId2',
            parentOrder: 1
          },
          {
            __typename: 'TypographyBlock',
            id: 'typographyBlockId1',
            parentOrder: 0
          }
        ]
      }
    }
  }

  it('should move selected block up on click', async () => {
    const result = jest.fn(() => ({ ...mockBlockOrderFirstMock.result }))
    const resultUndo = jest.fn(() => ({
      ...mockBlockOrderLastMock.result
    }))
    const resultRedo = jest.fn(() => ({
      ...mockBlockOrderFirstMock.result
    }))
    render(
      <MockedProvider
        mocks={[
          { ...mockBlockOrderFirstMock, result },
          { ...mockBlockOrderLastMock, result: resultUndo },
          { ...mockBlockOrderFirstMock, result: resultRedo }
        ]}
      >
        <EditorProvider
          initialState={{ selectedBlock: block2, selectedStep: step }}
        >
          <CommandProvider>
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
            <MoveBlock />
          </CommandProvider>
        </EditorProvider>
      </MockedProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'move-block-up' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(resultUndo).toHaveBeenCalled())
    await userEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(resultRedo).toHaveBeenCalled())
  })

  it('should move selected block down on click', async () => {
    const result = jest.fn(() => ({ ...mockBlockOrderLastMock.result }))
    const resultUndo = jest.fn(() => ({
      ...mockBlockOrderFirstMock.result
    }))
    const resultRedo = jest.fn(() => ({
      ...mockBlockOrderLastMock.result
    }))

    render(
      <MockedProvider
        mocks={[
          { ...mockBlockOrderLastMock, result },
          { ...mockBlockOrderFirstMock, result: resultUndo },
          { ...mockBlockOrderLastMock, result: resultRedo }
        ]}
      >
        <EditorProvider
          initialState={{
            selectedBlock: { ...block2, parentOrder: 0 },
            selectedStep: {
              ...step,
              children: [
                {
                  ...card,
                  children: [
                    { ...block1, parentOrder: 1 },
                    { ...block2, parentOrder: 0 }
                  ]
                }
              ]
            }
          }}
        >
          <CommandProvider>
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
            <MoveBlock />
          </CommandProvider>
        </EditorProvider>
      </MockedProvider>
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'move-block-down' })
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(resultUndo).toHaveBeenCalled())
    await userEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(resultRedo).toHaveBeenCalled())
  })

  it('should disable move up if first block', async () => {
    render(
      <MockedProvider>
        <EditorProvider
          initialState={{ selectedBlock: block1, selectedStep: step }}
        >
          <MoveBlock />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'move-block-up' })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'move-block-down' })
    ).not.toBeDisabled()
  })

  it('should disable move down if last block with parent order', async () => {
    render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedBlock: block2,
            selectedStep: {
              ...step,
              children: [{ ...card, children: [...card.children, block3] }]
            }
          }}
        >
          <MoveBlock />
        </EditorProvider>
      </MockedProvider>
    )

    expect(
      screen.getByRole('button', { name: 'move-block-up' })
    ).not.toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'move-block-down' })
    ).toBeDisabled()
  })

  it('should disable move if single block', async () => {
    const card: TreeBlock = {
      id: 'card0.id',
      __typename: 'CardBlock',
      parentBlockId: 'step0.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: [block1]
    }

    const stepWithOneBlock = { ...step, children: [card] }

    render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedBlock: block1,
            selectedStep: stepWithOneBlock
          }}
        >
          <MoveBlock />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'move-block-up' })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'move-block-down' })
    ).toBeDisabled()
  })
})
