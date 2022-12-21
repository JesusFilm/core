import { ComponentProps } from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { TypographyVariant } from '../../../../../../__generated__/globalTypes'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { TypographyEdit, TYPOGRAPHY_BLOCK_UPDATE_CONTENT } from '.'

describe('TypographyEdit', () => {
  const onDelete = jest.fn()
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
    visibleCaret: true,
    deleteSelf: onDelete
  }
  it('selects the input on click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <TypographyEdit {...props} />
      </MockedProvider>
    )
    const input = getByRole('textbox')
    fireEvent.click(input)
    expect(input).toHaveFocus()
  })

  it('saves the text content on outside click', async () => {
    const result = jest.fn(() => ({
      data: {
        typographyBlockUpdate: [
          {
            __typename: 'TypographyBlock',
            id: 'typography.id',
            content: 'updated content'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'typography.id',
                journeyId: 'journeyId',
                input: {
                  content: 'updated content'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            admin: true
          }}
        >
          <EditorProvider>
            <h1>Other content</h1>
            <iframe>
              <TypographyEdit {...props} />
            </iframe>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '    updated content    ' } })
    fireEvent.click(getByRole('heading', { level: 1 }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should save the text content on blur', async () => {
    const result = jest.fn(() => ({
      data: {
        typographyBlockUpdate: [
          {
            __typename: 'TypographyBlock',
            id: 'typography.id',
            content: 'updated content'
          }
        ]
      }
    }))

    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'typography.id',
                journeyId: 'journeyId',
                input: {
                  content: 'updated content'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            admin: true
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
      target: { value: '    updated content    ' }
    })
    fireEvent.blur(getByText('updated content'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should not call updateContent if the content is not changed', async () => {
    const result = jest.fn(() => ({
      data: {
        typographyBlockUpdate: [
          {
            __typename: 'TypographyBlock',
            id: 'typography.id',
            content: 'test content'
          }
        ]
      }
    }))

    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'typography.id',
                journeyId: 'journeyId',
                input: {
                  content: 'test content'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            admin: true
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
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('calls onDelete when text content deleted', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            admin: true
          }}
        >
          <h1>Other content</h1>
          <TypographyEdit {...props} />
        </JourneyProvider>
      </MockedProvider>
    )
    const input = getByRole('textbox')

    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.click(getByRole('heading', { level: 1 }))

    expect(onDelete).toHaveBeenCalled()
  })
})
