import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import type { TreeBlock } from '@core/journeys/ui/block'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { RadioOptionFields } from '../../../../../../__generated__/RadioOptionFields'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { RadioOptionEdit, RADIO_OPTION_BLOCK_UPDATE_CONTENT } from '.'

describe('RadioOptionEdit', () => {
  const props: TreeBlock<RadioOptionFields> = {
    __typename: 'RadioOptionBlock',
    id: 'option.id',
    label: 'test label',
    parentBlockId: 'card',
    parentOrder: 0,
    action: null,
    children: []
  }

  it('selects the input on click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <RadioOptionEdit {...props} />
      </MockedProvider>
    )
    const input = getByRole('textbox')
    fireEvent.click(input)
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('placeholder', 'Type your text here...')
  })

  it('saves the option label on onBlur', async () => {
    const result = jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
            label: 'updated label'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'option.id',
                journeyId: 'journeyId',
                input: {
                  label: 'updated label'
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
            <RadioOptionEdit {...props} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '    updated label    ' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should not save if label hasnt changed', async () => {
    const result = jest.fn(() => ({
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

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'option.id',
                journeyId: 'journeyId',
                input: {
                  label: 'test label'
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
            <RadioOptionEdit {...props} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox', { name: '' })
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'test label' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('saves the option label on outside click', async () => {
    const result = jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
            label: 'updated label'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'option.id',
                journeyId: 'journeyId',
                input: {
                  label: 'updated label'
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
              <RadioOptionEdit {...props} />
            </iframe>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '    updated label    ' } })
    fireEvent.click(getByRole('heading', { level: 1 }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should clear label if Option 1 or Option 2', () => {
    const args = {
      ...props,
      label: 'Option 1'
    }
    const { getByRole } = render(
      <MockedProvider>
        <RadioOptionEdit {...args} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: '' }))
  })
})
