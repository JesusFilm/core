import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { CommandRedoItem } from '../../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../../Toolbar/Items/CommandUndoItem'

import { TEXT_RESPONSE_HINT_UPDATE } from './Hint'

import { Hint } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const block: TreeBlock<TextResponseBlock> = {
  __typename: 'TextResponseBlock',
  id: 'textResponse0.id',
  parentBlockId: '0',
  parentOrder: 0,
  label: 'Your answer here',
  hint: 'A hint message',
  minRows: null,
  integrationId: null,
  type: null,
  routeId: null,
  children: []
}

interface HintMockProps {
  mocks?: Array<MockedResponse<Record<string, unknown>>>
  initialState?: { selectedBlock: TreeBlock<TextResponseBlock> | undefined }
}

const HintMock = ({
  mocks = [],
  initialState = { selectedBlock: block }
}: HintMockProps): ReactElement => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <EditorProvider initialState={initialState}>
      <CommandUndoItem variant="button" />
      <CommandRedoItem variant="button" />
      <Hint />
    </EditorProvider>
  </MockedProvider>
)

describe('Edit Hint field', () => {
  it('should display placeholder field if no selectedBlock', () => {
    const { getByRole } = render(
      <HintMock initialState={{ selectedBlock: undefined }} />
    )
    const field = getByRole('textbox', { name: 'Hint' })

    expect(field).toBeDisabled()
  })

  it('should display hint value', () => {
    const { getByRole } = render(<HintMock />)
    const field = getByRole('textbox', { name: 'Hint' })

    expect(field).toHaveValue('A hint message')
  })

  it('should not be able to type beyond max character limit', () => {
    const { getByRole } = render(<HintMock />)
    const field = getByRole('textbox', { name: 'Hint' })

    expect(field).toHaveAttribute('maxlength', '250')
  })

  it('should update the hint on blur', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          hint: 'Updated hint'
        }
      }
    }))

    const updateSuccess = {
      request: {
        query: TEXT_RESPONSE_HINT_UPDATE,
        variables: {
          id: block.id,
          input: {
            hint: 'Updated hint'
          }
        }
      },
      result
    }

    const { getByRole } = render(<HintMock mocks={[updateSuccess]} />)

    const field = getByRole('textbox', { name: 'Hint' })

    fireEvent.change(field, { target: { value: 'Updated hint' } })
    fireEvent.blur(field)

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })

  it('should undo hint change', async () => {
    const result1 = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          hint: 'Updated hint'
        }
      }
    }))

    const result2 = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          hint: 'A hint message'
        }
      }
    }))

    const mockUpdateSuccess1 = {
      request: {
        query: TEXT_RESPONSE_HINT_UPDATE,
        variables: {
          id: block.id,
          input: {
            hint: 'Updated hint'
          }
        }
      },
      result: result1
    }

    const mockUpdateSuccess2 = {
      request: {
        query: TEXT_RESPONSE_HINT_UPDATE,
        variables: {
          id: block.id,
          input: {
            hint: 'A hint message'
          }
        }
      },
      result: result2
    }

    render(<HintMock mocks={[mockUpdateSuccess1, mockUpdateSuccess2]} />)

    const field = screen.getByRole('textbox', { name: 'Hint' })
    fireEvent.change(field, { target: { value: 'Updated hint' } })
    fireEvent.blur(field)

    await waitFor(() => expect(result1).toHaveBeenCalled())
    await waitFor(() => expect(field).toHaveValue('Updated hint'))

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should redo the change to hint that was undone', async () => {
    const result1 = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          hint: 'Updated hint'
        }
      }
    }))

    const result2 = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          hint: 'A hint message'
        }
      }
    }))

    const mockUpdateSuccess1 = {
      request: {
        query: TEXT_RESPONSE_HINT_UPDATE,
        variables: {
          id: block.id,
          input: {
            hint: 'Updated hint'
          }
        }
      },
      result: result1,
      maxUsageCount: 2
    }

    const mockUpdateSuccess2 = {
      request: {
        query: TEXT_RESPONSE_HINT_UPDATE,
        variables: {
          id: block.id,
          input: {
            hint: 'A hint message'
          }
        }
      },
      result: result2
    }

    render(<HintMock mocks={[mockUpdateSuccess1, mockUpdateSuccess2]} />)

    const field = screen.getByRole('textbox', { name: 'Hint' })
    fireEvent.change(field, { target: { value: 'Updated hint' } })
    fireEvent.blur(field)

    await waitFor(() => expect(result1).toHaveBeenCalled())
    await waitFor(() => expect(field).toHaveValue('Updated hint'))

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(result1).toHaveBeenCalled())
  })
})
