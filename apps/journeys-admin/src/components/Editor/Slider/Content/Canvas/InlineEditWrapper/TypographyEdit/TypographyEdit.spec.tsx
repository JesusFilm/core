import { ApolloLink } from '@apollo/client'
import { MockLink, MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import DebounceLink from 'apollo-link-debounce'
import { ComponentProps } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { TypographyVariant } from '../../../../../../../../__generated__/globalTypes'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { TYPOGRAPHY_BLOCK_UPDATE_CONTENT, TypographyEdit } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TypographyEdit', () => {
  const props: ComponentProps<typeof TypographyEdit> = {
    __typename: 'TypographyBlock',
    parentBlockId: 'card.id',
    parentOrder: 0,
    id: 'typography.id',
    variant: TypographyVariant.body1,
    content: 'test content',
    align: null,
    color: null,
    children: [],
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
  }

  const mockUpdateSuccess1 = {
    request: {
      query: TYPOGRAPHY_BLOCK_UPDATE_CONTENT,
      variables: {
        id: 'typography.id',
        content: 'test'
      }
    },
    result: jest.fn(() => ({
      data: {
        typographyBlockUpdate: [
          {
            __typename: 'TypographyBlock',
            id: 'typography.id',
            content: 'test',
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
          }
        ]
      }
    }))
  }

  const mockUpdateSuccess2 = {
    request: {
      query: TYPOGRAPHY_BLOCK_UPDATE_CONTENT,
      variables: {
        id: 'typography.id',
        content: 'test content'
      }
    },
    result: jest.fn(() => ({
      data: {
        typographyBlockUpdate: [
          {
            __typename: 'TypographyBlock',
            id: 'typography.id',
            content: 'test content',
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
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
        <TypographyEdit {...props} />
      </MockedProvider>
    )
    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('placeholder', 'Add your text here...')
  })

  it('should not call updateContent if the content is not changed', async () => {
    const { getByText } = render(
      <MockedProvider mocks={[mockUpdateSuccess1]}>
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider>
            <TypographyEdit {...props} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByText('test content'))
    fireEvent.change(getByText('test content'), {
      target: { value: 'test content' }
    })
    fireEvent.blur(getByText('test content'))
    await waitFor(() =>
      expect(mockUpdateSuccess1.result).not.toHaveBeenCalled()
    )
  })

  it('persists selection state on outside click', async () => {
    render(
      <MockedProvider mocks={[mockUpdateSuccess1]}>
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <h1>Other content</h1>
          <TypographyEdit {...props} />
        </JourneyProvider>
      </MockedProvider>
    )
    const input = screen.getByRole('textbox')

    await userEvent.click(input)
    // All text selected on first focus
    expect(input).toHaveValue(props.content)
    await userEvent.clear(input)
    expect(input).toHaveValue('')

    // Cursor remains at end of input after outside click
    await userEvent.type(input, 'test')
    await userEvent.click(screen.getByRole('heading', { level: 1 }))
    await userEvent.type(input, '{backspace}')
    expect(input).toHaveValue('tes')
  })

  it('should undo the typography content change', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockUpdateSuccess1, mockUpdateSuccess2])
    ])

    render(
      <MockedProvider link={link}>
        <EditorProvider>
          <CommandUndoItem variant="button" />
          <TypographyEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'test', { skipClick: true })
    await waitFor(() => expect(mockUpdateSuccess1.result).toHaveBeenCalled())
    expect(input).toHaveTextContent('test')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockUpdateSuccess2.result).toHaveBeenCalled())
  })

  it('should redo the typography content change', async () => {
    const firstUpdateMock = {
      ...mockUpdateSuccess1,
      maxUsageCount: 2
    }

    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockUpdateSuccess1, mockUpdateSuccess2])
    ])

    render(
      <MockedProvider link={link}>
        <EditorProvider>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <TypographyEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'test', { skipClick: true })
    await waitFor(() => expect(firstUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockUpdateSuccess2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(firstUpdateMock.result).toHaveBeenCalled())
  })

  it('should resolve customization strings in non-template journeys', () => {
    const propsWithCustomization = {
      ...props,
      content: 'Hello {{ name }}, welcome to {{ company }}!'
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
            <TypographyEdit {...propsWithCustomization} />
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
      content: 'Company: {{ company }}'
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
            <TypographyEdit {...propsWithCustomization} />
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
      content: 'Hello {{ name }}, welcome!'
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
            <TypographyEdit {...propsWithCustomization} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('Hello {{ name }}, welcome!')
  })
})
