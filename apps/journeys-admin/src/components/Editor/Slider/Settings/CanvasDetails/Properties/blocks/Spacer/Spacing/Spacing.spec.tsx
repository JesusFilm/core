import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_SpacerBlock as SpacerBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  SpacerSpacingUpdate,
  SpacerSpacingUpdateVariables
} from '../../../../../../../../../../__generated__/SpacerSpacingUpdate'
import { CommandRedoItem } from '../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { SPACER_SPACING_UPDATE } from './Spacing'

import { Spacing } from '.'

describe('Spacing', () => {
  const selectedBlock: TreeBlock<SpacerBlock> = {
    __typename: 'SpacerBlock',
    id: 'id',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    spacing: 100,
    children: []
  }

  const spacingUpdateMock: MockedResponse<
    SpacerSpacingUpdate,
    SpacerSpacingUpdateVariables
  > = {
    request: {
      query: SPACER_SPACING_UPDATE,
      variables: {
        id: 'id',
        spacing: 200
      }
    },
    result: vi.fn(() => ({
      data: {
        spacerBlockUpdate: {
          id: 'id',
          spacing: 200,
          __typename: 'SpacerBlock'
        }
      }
    })) as MockedResponse<
      SpacerSpacingUpdate,
      SpacerSpacingUpdateVariables
    >['result']
  }

  const spacingUpdateMock2: MockedResponse<
    SpacerSpacingUpdate,
    SpacerSpacingUpdateVariables
  > = {
    request: {
      query: SPACER_SPACING_UPDATE,
      variables: {
        id: 'id',
        spacing: 100
      }
    },
    result: vi.fn(() => ({
      data: {
        spacerBlockUpdate: {
          id: 'id',
          spacing: 100,
          __typename: 'SpacerBlock'
        }
      }
    })) as MockedResponse<
      SpacerSpacingUpdate,
      SpacerSpacingUpdateVariables
    >['result']
  }

  beforeEach(() => vi.clearAllMocks())

  it('should show spacing description and slider', () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Spacing value={100} setValue={vi.fn()} />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('should change the spacing property', async () => {
    const setValue = vi.fn()

    render(
      <MockedProvider mocks={[spacingUpdateMock]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <Spacing value={100} setValue={setValue} />
        </EditorProvider>
      </MockedProvider>
    )

    const slider = screen.getByTestId('Label').querySelectorAll('input')[0]

    fireEvent.change(slider, { target: { value: 200 } })
    fireEvent.mouseUp(slider)

    await waitFor(() => expect(spacingUpdateMock.result).toHaveBeenCalled())
    expect(setValue).toHaveBeenCalledWith(200)
  })

  it('should undo the spacing change', async () => {
    const setValue = vi.fn()
    render(
      <MockedProvider mocks={[spacingUpdateMock, spacingUpdateMock2]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <Spacing value={100} setValue={setValue} />
        </EditorProvider>
      </MockedProvider>
    )
    const slider = screen.getByTestId('Label').querySelectorAll('input')[0]

    fireEvent.change(slider, { target: { value: 200 } })
    fireEvent.mouseUp(slider)

    await waitFor(() => expect(spacingUpdateMock.result).toHaveBeenCalled())
    expect(setValue).toHaveBeenCalledWith(200)

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(spacingUpdateMock2.result).toHaveBeenCalled())
    expect(setValue).toHaveBeenCalledWith(100)
  })

  it('should redo the undone spacing change', async () => {
    const mockFirstUpdate = {
      ...spacingUpdateMock,
      maxUsageCount: 2
    }

    const setValue = vi.fn()
    render(
      <MockedProvider mocks={[mockFirstUpdate, spacingUpdateMock2]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <Spacing value={100} setValue={setValue} />
        </EditorProvider>
      </MockedProvider>
    )
    const slider = screen.getByTestId('Label').querySelectorAll('input')[0]

    fireEvent.change(slider, { target: { value: 200 } })
    fireEvent.mouseUp(slider)

    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())
    expect(setValue).toHaveBeenCalledWith(200)

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(spacingUpdateMock2.result).toHaveBeenCalled())
    expect(setValue).toHaveBeenCalledWith(100)

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())
    expect(setValue).toHaveBeenCalledWith(200)
  })

  it('should not call mutation if no selected block', async () => {
    const setValue = vi.fn()

    render(
      <MockedProvider mocks={[spacingUpdateMock]}>
        <EditorProvider initialState={{}}>
          <Spacing value={100} setValue={setValue} />
        </EditorProvider>
      </MockedProvider>
    )
    const slider = screen.getByTestId('Label').querySelectorAll('input')[0]
    fireEvent.change(slider, { target: { value: 200 } })
    fireEvent.mouseUp(slider)

    await waitFor(() => expect(spacingUpdateMock.result).not.toHaveBeenCalled())
  })
})
