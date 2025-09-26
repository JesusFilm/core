import { ApolloLink } from '@apollo/client'
import { MockLink, MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import DebounceLink from 'apollo-link-debounce'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { RadioOptionFields } from '../../../../../../../../__generated__/RadioOptionFields'
import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { RADIO_OPTION_BLOCK_UPDATE_CONTENT, RadioOptionEdit } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('RadioOptionEdit', () => {
  const props: TreeBlock<RadioOptionFields> = {
    __typename: 'RadioOptionBlock',
    id: 'option.id',
    label: 'test label',
    parentBlockId: 'card',
    parentOrder: 0,
    action: null,
    pollOptionImageBlockId: null,
    children: []
  }

  const mockRadioOptionUpdate1 = {
    request: {
      query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
      variables: {
        id: 'option.id',
        input: {
          label: 'new label'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
            label: 'new label'
          }
        ]
      }
    }))
  }

  const mockRadioOptionUpdate2 = {
    request: {
      query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
      variables: {
        id: 'option.id',
        input: {
          label: 'test label'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
            label: 'test label'
          }
        ]
      }
    }))
  }

  const mockJourneyWithCustomization: Journey = {
    id: 'journeyId',
    template: false,
    journeyCustomizationFields: [
      {
        id: 'field1',
        key: 'name',
        value: 'John Doe',
        defaultValue: 'Guest'
      },
      {
        id: 'field2',
        key: 'company',
        value: null,
        defaultValue: 'Acme Corp'
      },
      {
        id: 'field3',
        key: 'email',
        value: 'john@example.com',
        defaultValue: 'guest@example.com'
      }
    ]
  } as unknown as Journey

  const mockTemplateJourney: Journey = {
    id: 'templateId',
    template: true,
    journeyCustomizationFields: []
  } as unknown as Journey

  beforeEach(() => jest.clearAllMocks())

  it('selects the input on click', () => {
    render(
      <MockedProvider>
        <RadioOptionEdit {...props} />
      </MockedProvider>
    )
    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('placeholder', 'Add your text here...')
  })

  it('should undo the label change', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockRadioOptionUpdate1, mockRadioOptionUpdate2])
    ])

    render(
      <MockedProvider link={link}>
        <EditorProvider>
          <CommandUndoItem variant="button" />
          <RadioOptionEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, 'new label', { skipClick: true })
    await waitFor(() =>
      expect(mockRadioOptionUpdate1.result).toHaveBeenCalled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(mockRadioOptionUpdate2.result).toHaveBeenCalled()
    )
  })

  it('should redo the change to label that was undone', async () => {
    const redoUpdateMock = {
      ...mockRadioOptionUpdate1
    }

    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([
        mockRadioOptionUpdate1,
        mockRadioOptionUpdate2,
        redoUpdateMock
      ])
    ])

    render(
      <MockedProvider link={link}>
        <EditorProvider>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <RadioOptionEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, 'new label', { skipClick: true })
    await waitFor(() =>
      expect(mockRadioOptionUpdate1.result).toHaveBeenCalled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(mockRadioOptionUpdate2.result).toHaveBeenCalled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(redoUpdateMock.result).toHaveBeenCalled())
  })

  it('should not save if label hasnt changed', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockRadioOptionUpdate2])
    ])

    render(
      <MockedProvider link={link}>
        <EditorProvider>
          <RadioOptionEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, 'test label')
    await waitFor(() =>
      expect(mockRadioOptionUpdate2.result).not.toHaveBeenCalled()
    )
  })

  it('should resolve customization strings in non-template journeys', () => {
    const propsWithCustomization = {
      ...props,
      label: 'Hello {{ name }}, welcome to {{ company }}!'
    }

    render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: mockJourneyWithCustomization,
            variant: 'admin'
          }}
        >
          <EditorProvider>
            <RadioOptionEdit {...propsWithCustomization} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('Hello John Doe, welcome to Acme Corp!')
  })

  it('should use defaultValue when value is null', () => {
    const propsWithCustomization = {
      ...props,
      label: 'Company: {{ company }}'
    }

    render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: mockJourneyWithCustomization,
            variant: 'admin'
          }}
        >
          <EditorProvider>
            <RadioOptionEdit {...propsWithCustomization} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('Company: Acme Corp')
  })

  it('should not resolve customization strings in template journeys', () => {
    const propsWithCustomization = {
      ...props,
      label: 'Hello {{ name }}, welcome!'
    }

    render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: mockTemplateJourney,
            variant: 'admin'
          }}
        >
          <EditorProvider>
            <RadioOptionEdit {...propsWithCustomization} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('Hello {{ name }}, welcome!')
  })
})
