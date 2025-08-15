import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_RadioQuestionBlock as RadioQuestionBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  RadioQuestionUpdate,
  RadioQuestionUpdateVariables
} from '../../../../../../../../../__generated__/RadioQuestionUpdate'
import { CommandRedoItem } from '../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../Toolbar/Items/CommandUndoItem'

import { RADIO_QUESTION_UPDATE } from './RadioQuestion'

import { RadioQuestion } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const selectedBlock: TreeBlock<RadioQuestionBlock> = {
  __typename: 'RadioQuestionBlock',
  id: 'radioQuestion.id',
  parentBlockId: 'step.id',
  parentOrder: 0,
  gridView: false,
  children: []
}

const PARENT_BLOCK_ID = 'step.id'

const selectedBlockWithGridView: TreeBlock<RadioQuestionBlock> = {
  __typename: 'RadioQuestionBlock',
  id: 'radioQuestion.id',
  parentBlockId: 'step.id',
  parentOrder: 0,
  gridView: true,
  children: []
}

const mockRadioQuestionUpdate: MockedResponse<
  RadioQuestionUpdate,
  RadioQuestionUpdateVariables
> = {
  request: {
    query: RADIO_QUESTION_UPDATE,
    variables: {
      id: selectedBlock.id,
      parentBlockId: PARENT_BLOCK_ID,
      gridView: true
    }
  },
  result: jest.fn(() => ({
    data: {
      radioQuestionBlockUpdate: {
        id: selectedBlock.id,
        parentBlockId: PARENT_BLOCK_ID,
        parentOrder: selectedBlock.parentOrder,
        gridView: true,
        __typename: 'RadioQuestionBlock'
      }
    }
  }))
}

const mockRadioQuestionUpdateUndo: MockedResponse<
  RadioQuestionUpdate,
  RadioQuestionUpdateVariables
> = {
  request: {
    query: RADIO_QUESTION_UPDATE,
    variables: {
      id: selectedBlock.id,
      parentBlockId: PARENT_BLOCK_ID,
      gridView: false
    }
  },
  result: jest.fn(() => ({
    data: {
      radioQuestionBlockUpdate: {
        id: selectedBlock.id,
        parentBlockId: PARENT_BLOCK_ID,
        parentOrder: selectedBlock.parentOrder,
        gridView: false,
        __typename: 'RadioQuestionBlock'
      }
    }
  }))
}

const mockRadioQuestionUpdateRedo: MockedResponse<
  RadioQuestionUpdate,
  RadioQuestionUpdateVariables
> = {
  request: {
    query: RADIO_QUESTION_UPDATE,
    variables: {
      id: selectedBlock.id,
      parentBlockId: PARENT_BLOCK_ID,
      gridView: true
    }
  },
  result: jest.fn(() => ({
    data: {
      radioQuestionBlockUpdate: {
        id: selectedBlock.id,
        parentBlockId: PARENT_BLOCK_ID,
        parentOrder: selectedBlock.parentOrder,
        gridView: true,
        __typename: 'RadioQuestionBlock'
      }
    }
  }))
}

describe('RadioQuestion Properties', () => {
  beforeEach(() => jest.clearAllMocks())

  it('should render with instructions text', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <RadioQuestion {...selectedBlock} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(
      screen.getByText('To edit poll content, choose each option individually.')
    ).toBeInTheDocument()
    expect(screen.getByText('Poll Variants')).toBeInTheDocument()
  })

  it('should select "Text Only" by default when gridView is false', async () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <RadioQuestion {...selectedBlock} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('AccordionSummary'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Text Only' })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
      expect(
        screen.getByRole('button', { name: 'Text and Image' })
      ).toHaveAttribute('aria-pressed', 'false')
    })
  })

  it('should select "Text and Image" when gridView is true', async () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider
            initialState={{ selectedBlock: selectedBlockWithGridView }}
          >
            <RadioQuestion {...selectedBlockWithGridView} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('AccordionSummary'))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Text and Image' })
      ).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: 'Text Only' })).toHaveAttribute(
        'aria-pressed',
        'false'
      )
    })
  })

  it('should change poll variant to "Text and Image"', async () => {
    render(
      <MockedProvider mocks={[mockRadioQuestionUpdate]}>
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <RadioQuestion {...selectedBlock} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('AccordionSummary'))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Text and Image' })
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Text and Image' }))
    await waitFor(() =>
      expect(mockRadioQuestionUpdate.result).toHaveBeenCalled()
    )
  })

  it('should undo poll variant change', async () => {
    render(
      <MockedProvider
        mocks={[mockRadioQuestionUpdate, mockRadioQuestionUpdateUndo]}
        addTypename={false}
      >
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <CommandUndoItem variant="button" />
            <RadioQuestion {...selectedBlock} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('AccordionSummary'))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Text and Image' })
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Text and Image' }))
    await waitFor(() =>
      expect(mockRadioQuestionUpdate.result).toHaveBeenCalled()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(mockRadioQuestionUpdateUndo.result).toHaveBeenCalled()
    )
  })

  it('should redo the poll variant change that was undone', async () => {
    render(
      <MockedProvider
        mocks={[
          mockRadioQuestionUpdate,
          mockRadioQuestionUpdateUndo,
          mockRadioQuestionUpdateRedo
        ]}
        addTypename={false}
      >
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
            <RadioQuestion {...selectedBlock} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    // Expand the accordion first
    fireEvent.click(screen.getByTestId('AccordionSummary'))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Text and Image' })
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Text and Image' }))
    await waitFor(() =>
      expect(mockRadioQuestionUpdate.result).toHaveBeenCalled()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(mockRadioQuestionUpdateUndo.result).toHaveBeenCalled()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() =>
      expect(mockRadioQuestionUpdateRedo.result).toHaveBeenCalled()
    )
  })

  it('should not call mutation if no parentBlockId', async () => {
    const blockWithoutParent = {
      ...selectedBlock,
      parentBlockId: null
    }

    render(
      <MockedProvider mocks={[mockRadioQuestionUpdate]} addTypename={false}>
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock: blockWithoutParent }}>
            <RadioQuestion {...blockWithoutParent} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('AccordionSummary'))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Text and Image' })
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Text and Image' }))
    await waitFor(() =>
      expect(mockRadioQuestionUpdate.result).not.toHaveBeenCalled()
    )
  })
})
