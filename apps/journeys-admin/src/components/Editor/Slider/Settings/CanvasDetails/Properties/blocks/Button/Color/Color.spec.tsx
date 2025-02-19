import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { ButtonColor } from '../../../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../../../__generated__/JourneyFields'
import { journeyUpdatedAtCacheUpdate } from '../../../../../../../../../libs/journeyUpdatedAtCacheUpdate'
import { CommandRedoItem } from '../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { BUTTON_BLOCK_UPDATE } from './Color'

import { Color } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('../../../../../../../../../libs/journeyUpdatedAtCacheUpdate', () => {
  return {
    journeyUpdatedAtCacheUpdate: jest.fn()
  }
})

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
    action: null,
    children: []
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
        <EditorProvider initialState={{ selectedBlock }}>
          <Color />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByRole('button', { name: 'Primary' })).toHaveClass(
      'Mui-selected'
    )
    expect(
      screen.getByRole('button', { name: 'Secondary' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Error' })).toBeInTheDocument()
  })

  it('should change the color property', async () => {
    render(
      <MockedProvider mocks={[colorUpdateMock]}>
        <JourneyProvider value={{ journey: {} as unknown as Journey }}>
          <EditorProvider initialState={{ selectedBlock }}>
            <Color />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.getByRole('button', { name: 'Primary' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(colorUpdateMock.result).toHaveBeenCalled())
    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
  })

  it('should undo the color change', async () => {
    render(
      <MockedProvider mocks={[colorUpdateMock, colorUpdateMock2]}>
        <JourneyProvider value={{ journey: {} as unknown as Journey }}>
          <EditorProvider initialState={{ selectedBlock }}>
            <CommandUndoItem variant="button" />
            <Color />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(colorUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(colorUpdateMock2.result).toHaveBeenCalled())

    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
  })

  it('should redo the undone color change', async () => {
    const mockFirstUpdate = {
      ...colorUpdateMock,
      maxUsageCount: 2
    }

    render(
      <MockedProvider mocks={[mockFirstUpdate, colorUpdateMock2]}>
        <JourneyProvider value={{ journey: {} as unknown as Journey }}>
          <EditorProvider initialState={{ selectedBlock }}>
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
            <Color />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(colorUpdateMock2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())

    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
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
    await waitFor(() =>
      expect(journeyUpdatedAtCacheUpdate).not.toHaveBeenCalled()
    )
  })
})
