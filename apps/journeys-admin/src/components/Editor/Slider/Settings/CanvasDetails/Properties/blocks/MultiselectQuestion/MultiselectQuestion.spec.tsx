import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_MultiselectBlock as MultiselectBlock } from '../../../../../../../../../__generated__/BlockFields'
import { CommandRedoItem } from '../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../Toolbar/Items/CommandUndoItem'

import { MULTISELECT_BLOCK_UPDATE } from './MultiselectQuestion'

import { MultiselectQuestion } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const selectedBlock: TreeBlock<MultiselectBlock> = {
  __typename: 'MultiselectBlock',
  id: 'multiselect.id',
  parentBlockId: 'step.id',
  parentOrder: 0,
  min: 0,
  max: 2,
  children: [
    {
      __typename: 'MultiselectOptionBlock',
      id: 'option1.id',
      parentBlockId: 'multiselect.id',
      parentOrder: 0,
      label: 'Option 1',
      children: []
    },
    {
      __typename: 'MultiselectOptionBlock',
      id: 'option2.id',
      parentBlockId: 'multiselect.id',
      parentOrder: 1,
      label: 'Option 2',
      children: []
    }
  ]
}

const mockUpdateMin: MockedResponse = {
  request: {
    query: MULTISELECT_BLOCK_UPDATE,
    variables: {
      id: selectedBlock.id,
      input: { min: 1 }
    }
  },
  result: () => ({
    data: {
      multiselectBlockUpdate: {
        __typename: 'MultiselectBlock',
        id: selectedBlock.id,
        parentBlockId: selectedBlock.parentBlockId,
        parentOrder: selectedBlock.parentOrder,
        min: 1,
        max: 2
      }
    }
  })
}

const mockUpdateMax: MockedResponse = {
  request: {
    query: MULTISELECT_BLOCK_UPDATE,
    variables: {
      id: selectedBlock.id,
      input: { max: 2 }
    }
  },
  result: () => ({
    data: {
      multiselectBlockUpdate: {
        __typename: 'MultiselectBlock',
        id: selectedBlock.id,
        parentBlockId: selectedBlock.parentBlockId,
        parentOrder: selectedBlock.parentOrder,
        min: 1,
        max: 2
      }
    }
  })
}

const mockUpdateBoth: MockedResponse = {
  request: {
    query: MULTISELECT_BLOCK_UPDATE,
    variables: {
      id: selectedBlock.id,
      input: { min: 1, max: 2 }
    }
  },
  result: jest.fn(() => ({
    data: {
      multiselectBlockUpdate: {
        __typename: 'MultiselectBlock',
        id: selectedBlock.id,
        parentBlockId: selectedBlock.parentBlockId,
        parentOrder: selectedBlock.parentOrder,
        min: 1,
        max: 2
      }
    }
  }))
}

describe('MultiselectQuestion Properties', () => {
  it('renders instructions and controls', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <MultiselectQuestion {...selectedBlock} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(
      screen.getByTestId('MultiselectQuestionProperties')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'To edit multiselect content, choose each option individually'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Selection Limit')).toBeInTheDocument()
  })

  it('changes label and range and commits on blur', async () => {
    render(
      <MockedProvider mocks={[mockUpdateMin, mockUpdateMax, mockUpdateBoth]}>
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
            <MultiselectQuestion {...selectedBlock} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const minInput = screen.getByRole('spinbutton', {
      name: 'Min selections'
    })
    const maxInput = screen.getByRole('spinbutton', {
      name: 'Max selections'
    })

    fireEvent.change(minInput, { target: { value: '1' } })
    fireEvent.change(maxInput, { target: { value: '2' } })

    fireEvent.blur(maxInput)

    await waitFor(() => expect(mockUpdateBoth.result).toHaveBeenCalled())
  })

  it('enabling selection limit sets max to number of options', async () => {
    const selectedBlockDisabled: TreeBlock<MultiselectBlock> = {
      __typename: 'MultiselectBlock',
      id: 'multiselect.id',
      parentBlockId: 'step.id',
      parentOrder: 0,
      min: null,
      max: null,
      children: [
        {
          __typename: 'MultiselectOptionBlock',
          id: 'option1.id',
          parentBlockId: 'multiselect.id',
          parentOrder: 0,
          label: 'Option 1',
          children: []
        },
        {
          __typename: 'MultiselectOptionBlock',
          id: 'option2.id',
          parentBlockId: 'multiselect.id',
          parentOrder: 1,
          label: 'Option 2',
          children: []
        }
      ]
    }

    const mockEnableSetsDefaults: MockedResponse = {
      request: {
        query: MULTISELECT_BLOCK_UPDATE,
        variables: {
          id: selectedBlockDisabled.id,
          input: { min: 0, max: 2 }
        }
      },
      result: jest.fn(() => ({
        data: {
          multiselectBlockUpdate: {
            __typename: 'MultiselectBlock',
            id: selectedBlockDisabled.id,
            parentBlockId: selectedBlockDisabled.parentBlockId,
            parentOrder: selectedBlockDisabled.parentOrder,
            min: 0,
            max: 2
          }
        }
      }))
    }

    render(
      <MockedProvider mocks={[mockEnableSetsDefaults]}>
        <SnackbarProvider>
          <EditorProvider
            initialState={{ selectedBlock: selectedBlockDisabled }}
          >
            <MultiselectQuestion {...selectedBlockDisabled} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const toggle = screen.getByRole('checkbox', {
      name: 'Selection Limit'
    })
    // enable
    fireEvent.click(toggle)

    await waitFor(() =>
      expect(mockEnableSetsDefaults.result as jest.Mock).toHaveBeenCalled()
    )
  })

  it('clamps max to 1 when user enters 0 and options exist', async () => {
    const mockClampMaxToOne: MockedResponse = {
      request: {
        query: MULTISELECT_BLOCK_UPDATE,
        variables: {
          id: selectedBlock.id,
          input: { max: 1 }
        }
      },
      result: jest.fn(() => ({
        data: {
          multiselectBlockUpdate: {
            __typename: 'MultiselectBlock',
            id: selectedBlock.id,
            parentBlockId: selectedBlock.parentBlockId,
            parentOrder: selectedBlock.parentOrder,
            min: selectedBlock.min,
            max: 1
          }
        }
      }))
    }

    render(
      <MockedProvider mocks={[mockClampMaxToOne]}>
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <MultiselectQuestion {...selectedBlock} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const maxInput = screen.getByRole('spinbutton', {
      name: 'Max selections'
    })

    fireEvent.change(maxInput, { target: { value: '0' } })

    await waitFor(() =>
      expect(mockClampMaxToOne.result as jest.Mock).toHaveBeenCalled()
    )
  })
})
