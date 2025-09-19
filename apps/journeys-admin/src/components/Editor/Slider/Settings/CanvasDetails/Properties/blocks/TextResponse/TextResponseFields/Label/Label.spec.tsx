import { ApolloLink } from '@apollo/client'
import { MockLink, MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import DebounceLink from 'apollo-link-debounce'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { CommandRedoItem } from '../../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../../Toolbar/Items/CommandUndoItem'

import { TEXT_RESPONSE_LABEL_UPDATE } from './Label'

import { Label } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Edit Label field', () => {
  const block: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponse0.id',
    parentBlockId: '0',
    parentOrder: 0,
    label: 'Your answer here',
    placeholder: null,
    hint: null,
    minRows: null,
    integrationId: null,
    type: null,
    routeId: null,
    required: null,
    children: []
  }

  const mockLabelUpdate1 = {
    request: {
      query: TEXT_RESPONSE_LABEL_UPDATE,
      variables: {
        id: block.id,
        label: 'Your answer here more'
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          label: 'Your answer here more'
        }
      }
    }))
  }

  const mockLabelUpdate2 = {
    request: {
      query: TEXT_RESPONSE_LABEL_UPDATE,
      variables: {
        id: block.id,
        label: 'Your answer here'
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          label: 'Your answer here'
        }
      }
    }))
  }

  const mockLabelUpdate3 = {
    request: {
      query: TEXT_RESPONSE_LABEL_UPDATE,
      variables: {
        id: block.id,
        label: 'Your answer here more'
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          label: 'Your answer here more'
        }
      }
    }))
  }

  const mockLabelUpdateWhitespace = {
    request: {
      query: TEXT_RESPONSE_LABEL_UPDATE,
      variables: {
        id: block.id,
        label: ''
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          label: ''
        }
      }
    }))
  }

  beforeEach(() => jest.clearAllMocks())

  it('should display label value', () => {
    render(
      <MockedProvider mocks={[mockLabelUpdate1]} addTypename={false}>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <Label />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Label' })
    expect(field).toHaveValue('Your answer here')
  })

  it('should not be able to type beyond max character limit', () => {
    render(
      <MockedProvider mocks={[mockLabelUpdate1]} addTypename={false}>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <Label />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Label' })
    expect(field).toHaveAttribute('maxlength', '250')
  })

  it('should change the label', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockLabelUpdate1])
    ])

    render(
      <MockedProvider link={link} addTypename={false}>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <Label />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Label' })
    await userEvent.type(field, ' more')
    await waitFor(() => expect(mockLabelUpdate1.result).toHaveBeenCalled())
  })

  it('should undo the label change', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockLabelUpdate1, mockLabelUpdate2])
    ])

    render(
      <MockedProvider link={link} addTypename={false}>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <CommandUndoItem variant="button" />
          <Label />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Label' })
    await userEvent.type(field, ' more')
    await waitFor(() => expect(mockLabelUpdate1.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockLabelUpdate2.result).toHaveBeenCalled())
  })

  it('should redo the change to label that was undone', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockLabelUpdate1, mockLabelUpdate2, mockLabelUpdate3])
    ])

    render(
      <MockedProvider link={link} addTypename={false}>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <Label />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Label' })
    await userEvent.type(field, ' more')
    await waitFor(() => expect(mockLabelUpdate1.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockLabelUpdate2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockLabelUpdate3.result).toHaveBeenCalled())
  })

  it('should not call mutation if not selectedBlock', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockLabelUpdate1])
    ])

    render(
      <MockedProvider link={link} addTypename={false}>
        <EditorProvider initialState={{}}>
          <Label />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Label' })
    await userEvent.type(field, ' more')
    await waitFor(() => expect(mockLabelUpdate1.result).not.toHaveBeenCalled())
  })

  it('should not call mutation if only whitespace is entered', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockLabelUpdateWhitespace])
    ])

    render(
      <MockedProvider link={link} addTypename={false}>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <Label />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Label' })
    await userEvent.clear(field)
    await userEvent.type(field, ' ')

    await waitFor(() => {
      expect(mockLabelUpdateWhitespace.result).not.toHaveBeenCalled()
    })
  })

  it('should resolve customizable label value', () => {
    const blockWithCustomizableLabel = {
      ...block,
      label: '{{ label }}'
    }

    const journeyWithCustomizableFields = {
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: '1',
          journeyId: 'journeyId',
          key: 'label',
          value: 'Your customized label',
          defaultValue: 'Default label'
        }
      ]
    } as unknown as Journey

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: journeyWithCustomizableFields, variant: 'admin' }}>
          <EditorProvider initialState={{ selectedBlock: blockWithCustomizableLabel }}>
            <Label />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Label' })
    expect(field).toHaveValue('Your customized label')
  })

  it('should not resolve customizable label value for template journeys', () => {
    const blockWithCustomizableLabel = {
      ...block,
      label: '{{ label }}'
    }

    const journeyWithCustomizableFields = {
      template: true,
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: '1',
          journeyId: 'journeyId',
          key: 'label',
          value: 'Your customized label',
          defaultValue: 'Default label'
        }
      ]
    } as unknown as Journey

    render(
      <MockedProvider mocks={[mockLabelUpdate1]} addTypename={false}>
        <JourneyProvider value={{ journey: journeyWithCustomizableFields, variant: 'admin' }}>
          <EditorProvider initialState={{ selectedBlock: blockWithCustomizableLabel }}>
            <Label />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Label' })
    expect(field).toHaveValue('{{ label }}')
  })
})
