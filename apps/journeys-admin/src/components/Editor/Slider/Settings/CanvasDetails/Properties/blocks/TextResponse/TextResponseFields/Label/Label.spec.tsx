import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { CommandRedoItem } from '../../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../../Toolbar/Items/CommandUndoItem'

import { TEXT_RESPONSE_LABEL_UPDATE } from './Label'

import { Label } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const block: TreeBlock<TextResponseBlock> = {
  __typename: 'TextResponseBlock',
  id: 'textResponse0.id',
  parentBlockId: '0',
  parentOrder: 0,
  label: 'Your answer',
  hint: null,
  minRows: null,
  integrationId: null,
  type: null,
  routeId: null,
  children: []
}
interface LabelMockProps {
  mocks?: Array<MockedResponse<Record<string, unknown>>>
  initialState?: { selectedBlock: TreeBlock<TextResponseBlock> | undefined }
}

const LabelMock = ({
  mocks = [],
  initialState = { selectedBlock: block }
}: LabelMockProps): ReactElement => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <EditorProvider initialState={initialState}>
      <CommandUndoItem variant="button" />
      <CommandRedoItem variant="button" />
      <Label />
    </EditorProvider>
  </MockedProvider>
)

describe('Edit Label field', () => {
  it('should display placeholder field if no selectedBlock', () => {
    const { getByRole } = render(
      <LabelMock initialState={{ selectedBlock: undefined }} />
    )
    const field = getByRole('textbox', { name: 'Label' })

    expect(field).toBeDisabled()
  })

  it('should display label value', () => {
    const { getByRole } = render(<LabelMock />)
    const field = getByRole('textbox', { name: 'Label' })

    expect(field).toHaveValue('Your answer')
  })

  it('should not be able to type beyond max character limit', () => {
    const { getByRole } = render(<LabelMock />)
    const field = getByRole('textbox', { name: 'Label' })

    expect(field).toHaveAttribute('maxlength', '250')
  })

  it('should update the label on blur', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          label: 'Updated label'
        }
      }
    }))

    const updateSuccess = {
      request: {
        query: TEXT_RESPONSE_LABEL_UPDATE,
        variables: {
          id: block.id,
          input: {
            label: 'Updated label'
          }
        }
      },
      result
    }

    const { getByRole } = render(<LabelMock mocks={[updateSuccess]} />)

    const field = getByRole('textbox', { name: 'Label' })

    fireEvent.change(field, { target: { value: 'Updated label' } })
    fireEvent.blur(field)

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })

  it('should undo the label change', async () => {
    const result1 = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          label: 'Your answer here more'
        }
      }
    }))

    const result2 = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          label: 'Your answer'
        }
      }
    }))

    const mockUpdateSuccess1 = {
      request: {
        query: TEXT_RESPONSE_LABEL_UPDATE,
        variables: {
          id: block.id,
          input: {
            label: 'Your answer here more'
          }
        }
      },
      result: result1
    }

    const mockUpdateSuccess2 = {
      request: {
        query: TEXT_RESPONSE_LABEL_UPDATE,
        variables: {
          id: block.id,
          input: {
            label: 'Your answer'
          }
        }
      },
      result: result2
    }

    render(<LabelMock mocks={[mockUpdateSuccess1, mockUpdateSuccess2]} />)

    const field = screen.getByRole('textbox', { name: 'Label' })
    fireEvent.change(field, { target: { value: 'Your answer here more' } })
    fireEvent.blur(field)

    await waitFor(() => expect(result1).toHaveBeenCalled())
    await waitFor(() => expect(field).toHaveValue('Your answer here more'))

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should redo the change to label that was undone', async () => {
    const result1 = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          label: 'Your answer here more'
        }
      }
    }))

    const result2 = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          label: 'Your answer'
        }
      }
    }))

    const mockUpdateSuccess1 = {
      request: {
        query: TEXT_RESPONSE_LABEL_UPDATE,
        variables: {
          id: block.id,
          input: {
            label: 'Your answer here more'
          }
        }
      },
      result: result1,
      maxUsageCount: 2
    }

    const mockUpdateSuccess2 = {
      request: {
        query: TEXT_RESPONSE_LABEL_UPDATE,
        variables: {
          id: block.id,
          input: {
            label: 'Your answer'
          }
        }
      },
      result: result2
    }

    render(<LabelMock mocks={[mockUpdateSuccess1, mockUpdateSuccess2]} />)

    const field = screen.getByRole('textbox', { name: 'Label' })
    fireEvent.change(field, { target: { value: 'Your answer here more' } })
    fireEvent.blur(field)

    await waitFor(() => expect(result1).toHaveBeenCalled())
    await waitFor(() => expect(field).toHaveValue('Your answer here more'))

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(result1).toHaveBeenCalled())
  })
})
