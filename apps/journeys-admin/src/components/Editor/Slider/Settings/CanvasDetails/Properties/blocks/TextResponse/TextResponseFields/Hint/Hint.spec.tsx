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

import { TEXT_RESPONSE_HINT_UPDATE } from './Hint'

import { Hint } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Edit Hint field', () => {
  const block: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponse0.id',
    parentBlockId: '0',
    parentOrder: 0,
    label: 'Your answer here',
    placeholder: null,
    hint: 'A hint message',
    minRows: null,
    integrationId: null,
    type: null,
    routeId: null,
    required: null,
    children: []
  }

  const initialState = {
    selectedBlock: block
  }

  const mockHintUpdate1 = {
    request: {
      query: TEXT_RESPONSE_HINT_UPDATE,
      variables: {
        id: block.id,
        hint: 'A hint message more'
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          hint: 'A hint message more'
        }
      }
    }))
  }

  const mockHintUpdate2 = {
    request: {
      query: TEXT_RESPONSE_HINT_UPDATE,
      variables: {
        id: block.id,
        hint: 'A hint message'
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          hint: 'A hint message'
        }
      }
    }))
  }

  const mockHintUpdate3 = {
    request: {
      query: TEXT_RESPONSE_HINT_UPDATE,
      variables: {
        id: block.id,
        hint: 'A hint message more'
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          hint: 'A hint message more'
        }
      }
    }))
  }

  beforeEach(() => jest.clearAllMocks())

  it('should display hint value', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <EditorProvider initialState={initialState}>
          <Hint />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Hint' })
    expect(field).toHaveValue('A hint message')
  })

  it('should not be able to type beyond max character limit', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <EditorProvider initialState={initialState}>
          <Hint />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Hint' })
    expect(field).toHaveAttribute('maxlength', '250')
  })

  it('should update the hint', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockHintUpdate1])
    ])

    render(
      <MockedProvider link={link} addTypename={false}>
        <EditorProvider initialState={initialState}>
          <Hint />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Hint' })
    await userEvent.type(field, ' more')
    await waitFor(() => expect(mockHintUpdate1.result).toHaveBeenCalled())
  })

  it('should undo hint change', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockHintUpdate1, mockHintUpdate2])
    ])

    render(
      <MockedProvider link={link} addTypename={false}>
        <EditorProvider initialState={initialState}>
          <CommandUndoItem variant="button" />
          <Hint />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Hint' })
    await userEvent.type(field, ' more')
    await waitFor(() => expect(mockHintUpdate1.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockHintUpdate2.result).toHaveBeenCalled())
  })

  it('should redo the change to hint that was undone', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockHintUpdate1, mockHintUpdate2, mockHintUpdate3])
    ])

    render(
      <MockedProvider link={link} addTypename={false}>
        <EditorProvider initialState={initialState}>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <Hint />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Hint' })
    await userEvent.type(field, ' more')
    await waitFor(() => expect(mockHintUpdate1.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockHintUpdate2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockHintUpdate3.result).toHaveBeenCalled())
  })

  it('should not call mutation if not selectedBlock', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockHintUpdate1])
    ])

    render(
      <MockedProvider link={link} addTypename={false}>
        <EditorProvider initialState={{}}>
          <Hint />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Hint' })
    await userEvent.type(field, ' more')
    await waitFor(() => expect(mockHintUpdate1.result).not.toHaveBeenCalled())
  })

  it('should resolve customizable hint value', () => {
    const blockWithCustomizableHint = {
      ...block,
      hint: '{{ hint }}'
    }

    const journeyWithCustomizableFields = {
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: '1',
          journeyId: 'journeyId',
          key: 'hint',
          value: 'Your customized hint',
          defaultValue: 'Default hint'
        }
      ]
    } as unknown as Journey

    render(
      <MockedProvider mocks={[mockHintUpdate1]} addTypename={false}>
        <JourneyProvider
          value={{ journey: journeyWithCustomizableFields, variant: 'admin' }}
        >
          <EditorProvider
            initialState={{ selectedBlock: blockWithCustomizableHint }}
          >
            <Hint />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Hint' })
    expect(field).toHaveValue('Your customized hint')
  })

  it('should not resolve customizable hint value for template journeys', () => {
    const blockWithCustomizableHint = {
      ...block,
      hint: '{{ hint }}'
    }

    const journeyWithCustomizableFields = {
      template: true,
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: '1',
          journeyId: 'journeyId',
          key: 'hint',
          value: 'Your customized hint',
          defaultValue: 'Default hint'
        }
      ]
    } as unknown as Journey

    render(
      <MockedProvider mocks={[mockHintUpdate1]} addTypename={false}>
        <JourneyProvider
          value={{ journey: journeyWithCustomizableFields, variant: 'admin' }}
        >
          <EditorProvider
            initialState={{ selectedBlock: blockWithCustomizableHint }}
          >
            <Hint />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Hint' })
    expect(field).toHaveValue('{{ hint }}')
  })
})
