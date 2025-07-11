import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../../../__generated__/BlockFields'
import {
  ButtonColor,
  ThemeMode,
  ThemeName
} from '../../../../../../../../../../__generated__/globalTypes'
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
    settings: {
      alignment: null,
      color: null,
      __typename: 'ButtonBlockSettings'
    }
  }

  const selectedStep: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'id',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    children: [
      {
        __typename: 'CardBlock',
        id: 'id',
        parentBlockId: 'parentBlockId',
        parentOrder: 0,
        children: [],
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base
      } as unknown as TreeBlock<CardBlock>
    ]
  } as unknown as TreeBlock<StepBlock>

  const colorUpdateMock = {
    request: {
      query: BUTTON_BLOCK_UPDATE,
      variables: {
        id: 'id',
        input: {
          settings: {
            color: '#B0BEC5'
          }
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          settings: {
            color: '#B0BEC5'
          }
        }
      }
    }))
  }

  const colorUpdateMock2 = {
    request: {
      query: BUTTON_BLOCK_UPDATE,
      variables: {
        id: 'id',
        input: {
          settings: {
            color: '#26262E'
          }
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          settings: {
            color: '#26262E'
          }
        }
      }
    }))
  }

  beforeEach(() => jest.clearAllMocks())

  it('should show button color properties when card is dark mode and settings color is null', () => {
    render(
      <MockedProvider mocks={[colorUpdateMock]}>
        <EditorProvider initialState={{ selectedBlock, selectedStep }}>
          <Color />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('bgColorPicker')).toBeInTheDocument()
    expect(screen.getByTestId('Swatch-bg-color-#FEFEFE')).toHaveStyle({
      backgroundColor: '#FEFEFE'
    })
    expect(screen.getByTestId('JourneysAdminTextFieldForm')).toBeInTheDocument()
  })

  it('should show button color properties when card is light mode and settings color is null', () => {
    const lightModeStep = {
      ...selectedStep,
      children: [
        {
          __typename: 'CardBlock',
          id: 'id',
          parentBlockId: 'parentBlockId',
          parentOrder: 0,
          children: [],
          themeMode: ThemeMode.light,
          themeName: ThemeName.base
        } as unknown as TreeBlock<CardBlock>
      ]
    }

    render(
      <MockedProvider mocks={[colorUpdateMock]}>
        <EditorProvider
          initialState={{ selectedBlock, selectedStep: lightModeStep }}
        >
          <Color />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('bgColorPicker')).toBeInTheDocument()
    expect(screen.getByTestId('Swatch-bg-color-#26262E')).toHaveStyle({
      backgroundColor: '#26262E'
    })
    expect(screen.getByTestId('JourneysAdminTextFieldForm')).toBeInTheDocument()
  })

  it('should change the color property via text field', async () => {
    render(
      <MockedProvider mocks={[colorUpdateMock]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <Color />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '#B0BEC5' }
    })
    await waitFor(() => expect(colorUpdateMock.result).toHaveBeenCalled())
  })

  it('should not call mutation if invalid hex color is entered', async () => {
    render(
      <MockedProvider mocks={[colorUpdateMock]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <Color />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '#INVALIDHEX' }
    })
    await waitFor(() => expect(colorUpdateMock.result).not.toHaveBeenCalled())
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

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '#B0BEC5' }
    })
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
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '#B0BEC5' }
    })
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(colorUpdateMock2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())
  })
})
