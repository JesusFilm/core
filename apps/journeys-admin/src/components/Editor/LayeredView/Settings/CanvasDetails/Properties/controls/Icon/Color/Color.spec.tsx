import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

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
    submitEnabled: null,
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
    ],
    settings: null
  }

  const mockIconColorUpdate1 = {
    request: {
      query: ICON_BLOCK_COLOR_UPDATE,
      variables: {
        id: 'iconBlock.id',
        color: IconColor.secondary
      }
    },
    result: jest.fn(() => ({
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
  }

  const mockIconColorUpdate2 = {
    request: {
      query: ICON_BLOCK_COLOR_UPDATE,
      variables: {
        id: 'iconBlock.id',
        color: IconColor.inherit
      }
    },
    result: jest.fn(() => ({
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
  }

  beforeEach(() => jest.clearAllMocks())

  it('should change the icon color', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[mockIconColorUpdate1]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <Color id="iconBlock.id" iconColor={IconColor.inherit} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Default' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(mockIconColorUpdate1.result).toHaveBeenCalled())
  })

  it('should undo the icon color change', async () => {
    render(
      <MockedProvider mocks={[mockIconColorUpdate1, mockIconColorUpdate2]}>
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
    await waitFor(() => expect(mockIconColorUpdate1.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockIconColorUpdate2.result).toHaveBeenCalled())
  })

  it('should redo the icon color change that was undone', async () => {
    const mockFirstUpdate = {
      ...mockIconColorUpdate1,
      maxUsageCount: 2
    }
    render(
      <MockedProvider mocks={[mockFirstUpdate, mockIconColorUpdate2]}>
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
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockIconColorUpdate2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())
  })
})
