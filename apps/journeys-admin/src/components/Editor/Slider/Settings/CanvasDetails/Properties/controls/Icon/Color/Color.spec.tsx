import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  IconColor,
  IconName
} from '../../../../../../../../../../__generated__/globalTypes'

import { CommandRedoItem } from '../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { Color, ICON_BLOCK_COLOR_UPDATE } from './Color'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Color', () => {
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
    action: null,
    children: [
      {
        __typename: 'IconBlock',
        id: 'iconBlock.id',
        parentBlockId: null,
        parentOrder: null,
        iconName: IconName.ArrowForwardRounded,
        iconSize: null,
        iconColor: null,
        children: []
      }
    ]
  }
  it('should change the icon color', async () => {
    const result = jest.fn(() => ({
      data: {
        iconBlockUpdate: {
          id: 'iconBlock.id',
          parentBlockId: 'buttonBlockId',
          name: IconName.ArrowForwardRounded,
          color: IconColor.secondary,
          size: null
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: ICON_BLOCK_COLOR_UPDATE,
              variables: {
                id: 'iconBlock.id',
                input: {
                  color: IconColor.secondary
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Color id="iconBlock.id" iconColor={IconColor.inherit} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Default' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should undo the icon color change', async () => {
    const result1 = jest.fn(() => ({
      data: {
        iconBlockUpdate: {
          id: 'iconBlock.id',
          parentBlockId: 'buttonBlockId',
          name: IconName.ArrowForwardRounded,
          color: IconColor.secondary,
          size: null
        }
      }
    }))

    const mockUpdateSuccess1 = {
      request: {
        query: ICON_BLOCK_COLOR_UPDATE,
        variables: {
          id: 'iconBlock.id',
          input: {
            color: IconColor.secondary
          }
        }
      },
      result: result1
    }

    const result2 = jest.fn(() => ({
      data: {
        iconBlockUpdate: {
          id: 'iconBlock.id',
          parentBlockId: 'buttonBlockId',
          name: IconName.ArrowForwardRounded,
          color: IconColor.inherit,
          size: null
        }
      }
    }))

    const mockUpdateSuccess2 = {
      request: {
        query: ICON_BLOCK_COLOR_UPDATE,
        variables: {
          id: 'iconBlock.id',
          input: {
            color: IconColor.inherit
          }
        }
      },
      result: result2
    }

    render(
      <MockedProvider mocks={[mockUpdateSuccess1, mockUpdateSuccess2]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <Color id="iconBlock.id" iconColor={IconColor.inherit} />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Default' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(result1).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should redo the icon color change that was undone', async () => {
    const result1 = jest.fn(() => ({
      data: {
        iconBlockUpdate: {
          id: 'iconBlock.id',
          parentBlockId: 'buttonBlockId',
          name: IconName.ArrowForwardRounded,
          color: IconColor.secondary,
          size: null
        }
      }
    }))

    const mockUpdateSuccess1 = {
      request: {
        query: ICON_BLOCK_COLOR_UPDATE,
        variables: {
          id: 'iconBlock.id',
          input: {
            color: IconColor.secondary
          }
        }
      },
      result: result1,
      maxUsageCount: 2
    }

    const result2 = jest.fn(() => ({
      data: {
        iconBlockUpdate: {
          id: 'iconBlock.id',
          parentBlockId: 'buttonBlockId',
          name: IconName.ArrowForwardRounded,
          color: IconColor.inherit,
          size: null
        }
      }
    }))

    const mockUpdateSuccess2 = {
      request: {
        query: ICON_BLOCK_COLOR_UPDATE,
        variables: {
          id: 'iconBlock.id',
          input: {
            color: IconColor.inherit
          }
        }
      },
      result: result2
    }

    render(
      <MockedProvider mocks={[mockUpdateSuccess1, mockUpdateSuccess2]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <Color id="iconBlock.id" iconColor={IconColor.inherit} />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Default' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(result1).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(result1).toHaveBeenCalled())
  })
})
