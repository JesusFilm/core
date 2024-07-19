import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/BlockFields'
import { IconFields } from '../../../../../../../../../__generated__/IconFields'
import { IconName } from '../../../../../../../../../__generated__/globalTypes'

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

  it('shows toggle options if there is a icon', () => {
    const { getByText } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Icon id={icon.id} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByText('Color')).toBeInTheDocument()
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

    const { queryByText } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock: testSelectedBlock }}>
          <Icon id={testIcon.id} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(queryByText('Color')).not.toBeInTheDocument()
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

    const result = jest.fn(() => ({
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

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: ICON_BLOCK_NAME_UPDATE,
              variables: {
                id: icon.id,
                input: {
                  name: IconName.ArrowForwardRounded
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock: testSelectedBlock }}>
          <Icon id={testIcon.id} />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(getByRole('button', { name: 'icon-name' }))
    fireEvent.click(getByRole('option', { name: 'Arrow Right' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('removes icon when selecing the default option', async () => {
    const result = jest.fn(() => ({
      data: {
        iconBlockUpdate: {
          id: 'iconBlock.id',
          parentBlockId: 'buttonBlockId',
          name: null,
          color: null,
          size: null
        }
      }
    }))

    const { getByRole } = render(
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
    fireEvent.mouseDown(getByRole('button', { name: 'icon-name' }))
    fireEvent.click(getByRole('option', { name: 'Select an icon...' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('changes the icon when selecting a different icon', async () => {
    const result = jest.fn(() => ({
      data: {
        iconBlockUpdate: {
          id: 'iconBlock.id',
          parentBlockId: 'buttonBlockId',
          name: IconName.BeenhereRounded,
          color: null,
          size: null
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: ICON_BLOCK_NAME_UPDATE,
              variables: {
                id: icon.id,
                input: {
                  name: IconName.BeenhereRounded
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
    fireEvent.mouseDown(getByRole('button', { name: 'icon-name' }))
    fireEvent.click(getByRole('option', { name: 'Been Here' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should undo the label change', async () => {
    const result1 = jest.fn(() => ({
      data: {
        iconBlockUpdate: {
          id: 'iconBlock.id',
          parentBlockId: 'buttonBlockId',
          name: IconName.BeenhereRounded,
          color: null,
          size: null
        }
      }
    }))

    const mockUpdateSuccess1 = {
      request: {
        query: ICON_BLOCK_NAME_UPDATE,
        variables: {
          id: icon.id,
          input: {
            name: IconName.BeenhereRounded
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
          color: null,
          size: null
        }
      }
    }))

    const mockUpdateSuccess2 = {
      request: {
        query: ICON_BLOCK_NAME_UPDATE,
        variables: {
          id: icon.id,
          input: {
            name: IconName.ArrowForwardRounded
          }
        }
      },
      result: result2
    }

    render(
      <MockedProvider mocks={[mockUpdateSuccess1, mockUpdateSuccess2]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <Icon id={icon.id} />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(screen.getByRole('button', { name: 'icon-name' }))
    fireEvent.click(screen.getByRole('option', { name: 'Been Here' }))
    await waitFor(() => expect(result1).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })
})
