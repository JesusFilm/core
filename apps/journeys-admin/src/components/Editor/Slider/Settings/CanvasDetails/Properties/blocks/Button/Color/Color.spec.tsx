import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  ButtonColor,
  ThemeMode,
  ThemeName
} from '../../../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../../../ThemeProvider'
import { CommandRedoItem } from '../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { BUTTON_BLOCK_UPDATE } from './Color'

import { Color } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Button color selector', () => {
  const selectedBlock: TreeBlock<ButtonBlock> = {
    __typename: 'ButtonBlock',
    id: 'id',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    label: 'test button',
    buttonVariant: null,
    buttonColor: ButtonColor.primary,
    size: null,
    startIconId: null,
    endIconId: null,
    submitEnabled: null,
    action: null,
    children: [],
    settings: null
  }

  const colorUpdateMock = {
    request: {
      query: BUTTON_BLOCK_UPDATE,
      variables: {
        id: 'id',
        color: ButtonColor.secondary
      }
    },
    result: jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          color: ButtonColor.secondary
        }
      }
    }))
  }

  const colorUpdateMock2 = {
    request: {
      query: BUTTON_BLOCK_UPDATE,
      variables: {
        id: 'id',
        color: ButtonColor.primary
      }
    },
    result: jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          color: ButtonColor.primary
        }
      }
    }))
  }

  beforeEach(() => jest.clearAllMocks())

  it('should show button color properties', () => {
    render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <Color />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('bgColorPicker')).toBeInTheDocument()
    expect(screen.getByTestId('Swatch-bg-color-#26262E')).toHaveStyle({
      backgroundColor: '#26262E'
    })
    expect(screen.getByTestId('JourneysAdminTextFieldForm')).toBeInTheDocument()
  })

  it('should change the color property', async () => {
    render(
      <MockedProvider mocks={[colorUpdateMock]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <Color />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getAllByTestId('Swatch-#B0BEC5')[0])
    await waitFor(() => expect(colorUpdateMock.result).toHaveBeenCalled())
  })

  it('should undo the color change', async () => {
    render(
      <MockedProvider mocks={[colorUpdateMock, colorUpdateMock2]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <Color />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(colorUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(colorUpdateMock2.result).toHaveBeenCalled())
  })

  it('should redo the undone color change', async () => {
    const mockFirstUpdate = {
      ...colorUpdateMock,
      maxUsageCount: 2
    }

    render(
      <MockedProvider mocks={[mockFirstUpdate, colorUpdateMock2]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <Color />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(colorUpdateMock2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())
  })

  it('should not call mutation if no selected block', async () => {
    render(
      <MockedProvider mocks={[colorUpdateMock]}>
        <EditorProvider initialState={{}}>
          <Color />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(colorUpdateMock.result).not.toHaveBeenCalled())
  })
})
