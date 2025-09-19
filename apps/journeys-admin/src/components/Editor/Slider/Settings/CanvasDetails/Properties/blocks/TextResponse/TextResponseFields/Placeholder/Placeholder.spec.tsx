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

import { TEXT_RESPONSE_PLACEHOLDER_UPDATE } from './Placeholder'

import { Placeholder } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Edit Placeholder field', () => {
  const block: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponse0.id',
    parentBlockId: '0',
    parentOrder: 0,
    label: 'Your answer here',
    placeholder: 'Your placeholder here',
    hint: null,
    minRows: null,
    integrationId: null,
    type: null,
    routeId: null,
    required: null,
    children: []
  }

  const mockPlaceholderUpdate1 = {
    request: {
      query: TEXT_RESPONSE_PLACEHOLDER_UPDATE,
      variables: {
        id: block.id,
        placeholder: 'Your placeholder here more'
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          placeholder: 'Your placeholder here more'
        }
      }
    }))
  }

  const mockPlaceholderUpdate2 = {
    request: {
      query: TEXT_RESPONSE_PLACEHOLDER_UPDATE,
      variables: {
        id: block.id,
        placeholder: 'Your placeholder here'
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          placeholder: 'Your placeholder here'
        }
      }
    }))
  }

  const mockPlaceholderUpdate3 = {
    request: {
      query: TEXT_RESPONSE_PLACEHOLDER_UPDATE,
      variables: {
        id: block.id,
        placeholder: 'Your placeholder here more'
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          placeholder: 'Your placeholder here more'
        }
      }
    }))
  }

  beforeEach(() => jest.clearAllMocks())

  it('should display placeholder value', () => {
    render(
      <MockedProvider mocks={[mockPlaceholderUpdate1]} addTypename={false}>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <Placeholder />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Placeholder' })
    expect(field).toHaveValue('Your placeholder here')
  })

  it('should resolve customizable placeholder value for journeys that are not templates', () => {
    const blockWithCustomizablePlaceholder = {
      ...block,
      placeholder: '{{ placeholder }}'
    }

    const journeyWithCustomizableFields = {
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: '1',
          journeyId: 'journeyId',
          key: 'placeholder',
          value: 'Your customized placeholder',
          defaultValue: 'Default placeholder'
        }
      ]
    } as unknown as Journey

    render(
      <MockedProvider>
        <JourneyProvider
          value={{ journey: journeyWithCustomizableFields, variant: 'admin' }}
        >
          <EditorProvider
            initialState={{ selectedBlock: blockWithCustomizablePlaceholder }}
          >
            <Placeholder />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Placeholder' })
    expect(field).toHaveValue('Your customized placeholder')
  })

  it('should not resolve customizable placeholder value for template journeys', () => {
    const blockWithCustomizablePlaceholder = {
      ...block,
      placeholder: '{{ placeholder }}'
    }

    const journeyWithCustomizableFields = {
      template: true,
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: '1',
          journeyId: 'journeyId',
          key: 'placeholder',
          value: 'Your customized placeholder',
          defaultValue: 'Default placeholder'
        }
      ]
    } as unknown as Journey

    render(
      <MockedProvider>
        <JourneyProvider
          value={{ journey: journeyWithCustomizableFields, variant: 'admin' }}
        >
          <EditorProvider
            initialState={{ selectedBlock: blockWithCustomizablePlaceholder }}
          >
            <Placeholder />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Placeholder' })
    expect(field).toHaveValue('{{ placeholder }}')
  })

  it('should not be able to type beyond max character limit', () => {
    render(
      <MockedProvider mocks={[mockPlaceholderUpdate1]} addTypename={false}>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <Placeholder />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Placeholder' })
    expect(field).toHaveAttribute('maxlength', '250')
  })

  it('should change the placeholder', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockPlaceholderUpdate1])
    ])

    render(
      <MockedProvider link={link} addTypename={false}>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <Placeholder />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Placeholder' })
    await userEvent.type(field, ' more')
    await waitFor(() =>
      expect(mockPlaceholderUpdate1.result).toHaveBeenCalled()
    )
  })

  it('should undo the placeholder change', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockPlaceholderUpdate1, mockPlaceholderUpdate2])
    ])

    render(
      <MockedProvider link={link} addTypename={false}>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <CommandUndoItem variant="button" />
          <Placeholder />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Placeholder' })
    await userEvent.type(field, ' more')
    await waitFor(() =>
      expect(mockPlaceholderUpdate1.result).toHaveBeenCalled()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(mockPlaceholderUpdate2.result).toHaveBeenCalled()
    )
  })

  it('should redo the change to placeholder that was undone', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([
        mockPlaceholderUpdate1,
        mockPlaceholderUpdate2,
        mockPlaceholderUpdate3
      ])
    ])

    render(
      <MockedProvider link={link} addTypename={false}>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <Placeholder />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Placeholder' })
    await userEvent.type(field, ' more')
    await waitFor(() =>
      expect(mockPlaceholderUpdate1.result).toHaveBeenCalled()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(mockPlaceholderUpdate2.result).toHaveBeenCalled()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() =>
      expect(mockPlaceholderUpdate3.result).toHaveBeenCalled()
    )
  })

  it('should not call mutation if not selectedBlock', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockPlaceholderUpdate1])
    ])

    render(
      <MockedProvider link={link} addTypename={false}>
        <EditorProvider initialState={{}}>
          <Placeholder />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Placeholder' })
    await userEvent.type(field, ' here')
    await waitFor(() =>
      expect(mockPlaceholderUpdate1.result).not.toHaveBeenCalled()
    )
  })
})
