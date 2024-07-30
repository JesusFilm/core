import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/BlockFields'
import { IconFields } from '../../../../../../../../../__generated__/IconFields'
import { IconName } from '../../../../../../../../../__generated__/globalTypes'

import { CommandRedoItem } from '../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../Toolbar/Items/CommandUndoItem'
import { ICON_BLOCK_NAME_UPDATE } from './Icon'

import { Icon } from '.'
jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Icon', () => {
  const icon: TreeBlock<IconFields> = {
    id: 'iconBlock.id',
    parentBlockId: 'buttonBlockId',
    parentOrder: null,
    __typename: 'IconBlock',
    iconName: IconName.ArrowForwardRounded,
    iconSize: null,
    iconColor: null,
    children: []
  }

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
    children: [icon]
  }

  const iconUpdateMock = {
    request: {
      query: ICON_BLOCK_NAME_UPDATE,
      variables: {
        id: icon.id,
        input: {
          name: IconName.CheckCircleRounded
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        iconBlockUpdate: {
          id: 'iconBlock.id',
          parentBlockId: 'buttonBlockId',
          name: IconName.CheckCircleRounded,
          color: null,
          size: null
        }
      }
    }))
  }

  const iconUpdateMock2 = {
    request: {
      query: ICON_BLOCK_NAME_UPDATE,
      variables: {
        id: icon.id,
        input: {
          name: IconName.ArrowForwardRounded
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        iconBlockUpdate: {
          id: 'iconBlock.id',
          parentBlockId: 'buttonBlockId',
          name: IconName.ArrowForwardRounded,
          color: null,
          size: null
        }
      }
    }))
  }

  beforeEach(() => jest.clearAllMocks())

  it('shows toggle options if there is a icon', () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Icon id={icon.id} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByText('Color')).toBeInTheDocument()
  })

  it('hides toggle options if there is no icon', () => {
    const testIcon = {
      ...icon,
      iconName: null
    }

    const testSelectedBlock = {
      ...selectedBlock,
      children: [testIcon]
    }

    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock: testSelectedBlock }}>
          <Icon id={testIcon.id} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.queryByText('Color')).not.toBeInTheDocument()
  })

  it('adds icon when selecting an icon', async () => {
    const testIcon = {
      ...icon,
      iconName: null
    }

    const testSelectedBlock = {
      ...selectedBlock,
      children: [testIcon]
    }

    render(
      <MockedProvider mocks={[iconUpdateMock]}>
        <EditorProvider initialState={{ selectedBlock: testSelectedBlock }}>
          <Icon id={testIcon.id} />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(screen.getByRole('button', { name: 'icon-name' }))
    fireEvent.click(screen.getByRole('option', { name: 'Check Circle' }))
    await waitFor(() => expect(iconUpdateMock.result).toHaveBeenCalled())
  })

  it('removes icon when selecing the default option', async () => {
    const result = jest.fn(() => ({
      data: {
        iconBlockUpdate: {
          id: 'iconBlock.id',
          journeyId: 'journeyId',
          parentBlockId: 'buttonBlockId',
          name: null,
          color: null,
          size: null
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: ICON_BLOCK_NAME_UPDATE,
              variables: {
                id: icon.id,
                input: {
                  name: null
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Icon id={icon.id} />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.mouseDown(screen.getByRole('button', { name: 'icon-name' }))
    fireEvent.click(screen.getByRole('option', { name: 'Select an icon...' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should undo the icon change', async () => {
    render(
      <MockedProvider mocks={[iconUpdateMock, iconUpdateMock2]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <Icon id={icon.id} />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.mouseDown(screen.getByRole('button', { name: 'icon-name' }))
    fireEvent.click(screen.getByRole('option', { name: 'Check Circle' }))
    await waitFor(() => expect(iconUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(iconUpdateMock2.result).toHaveBeenCalled())
  })

  it('should redo the undone icon change', async () => {
    const firstUpdateMock = {
      ...iconUpdateMock,
      maxUsageCount: 2
    }

    render(
      <MockedProvider mocks={[firstUpdateMock, iconUpdateMock2]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <Icon id={icon.id} />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.mouseDown(screen.getByRole('button', { name: 'icon-name' }))
    fireEvent.click(screen.getByRole('option', { name: 'Check Circle' }))
    await waitFor(() => expect(firstUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(iconUpdateMock2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(firstUpdateMock.result).toHaveBeenCalled())
  })
})
