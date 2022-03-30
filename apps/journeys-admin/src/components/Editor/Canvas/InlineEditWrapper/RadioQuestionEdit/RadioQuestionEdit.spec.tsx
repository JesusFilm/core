import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { RadioQuestionFields } from '../../../../../../__generated__/RadioQuestionFields'
import { RadioOptionFields } from '../../../../../../__generated__/RadioOptionFields'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../../../libs/context'
import { RADIO_OPTION_BLOCK_CREATE } from './RadioQuestionEdit'
import { RadioQuestionEdit, RADIO_QUESTION_BLOCK_UPDATE_CONTENT } from '.'

describe('RadioQuestionEdit', () => {
  const props = (
    children?: Array<TreeBlock<RadioOptionFields>>
  ): TreeBlock<RadioQuestionFields> => {
    return {
      __typename: 'RadioQuestionBlock',
      parentBlockId: 'card.id',
      parentOrder: 0,
      id: 'radioQuestion.id',
      label: 'heading',
      description: 'description',
      children: children ?? []
    }
  }

  const option: TreeBlock<RadioOptionFields> = {
    __typename: 'RadioOptionBlock',
    id: 'option.id',
    label: 'test label',
    parentBlockId: 'card',
    parentOrder: 0,
    action: null,
    children: []
  }

  it('selects the heading input by default on click', () => {
    const { getAllByRole } = render(
      <MockedProvider>
        <RadioQuestionEdit {...props()} />
      </MockedProvider>
    )
    const input = getAllByRole('textbox')[0]
    fireEvent.click(input)
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('placeholder', 'Type your question here...')
  })

  it('saves the heading content on blur', async () => {
    const result = jest.fn(() => ({
      data: {
        radioQuestionBlockUpdate: [
          {
            __typename: 'RadioQuestionBlock',
            id: 'radioQuestion.id',
            label: 'updated heading',
            description: 'description'
          }
        ]
      }
    }))

    const { getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_QUESTION_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'radioQuestion.id',
                journeyId: 'journeyId',
                input: {
                  label: 'updated heading',
                  description: 'description'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
          <EditorProvider>
            <RadioQuestionEdit {...props()} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = getAllByRole('textbox')[0]
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '    updated heading    ' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('saves the description content on blur', async () => {
    const result = jest.fn(() => ({
      data: {
        radioQuestionBlockUpdate: [
          {
            __typename: 'RadioQuestionBlock',
            id: 'radioQuestion.id',
            label: 'heading',
            description: 'updated description'
          }
        ]
      }
    }))

    const { getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_QUESTION_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'radioQuestion.id',
                journeyId: 'journeyId',
                input: {
                  label: 'heading',
                  description: 'updated description'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
          <EditorProvider>
            <RadioQuestionEdit {...props()} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = getAllByRole('textbox')[1]
    fireEvent.click(input)
    fireEvent.change(input, {
      target: { value: '    updated description    ' }
    })
    fireEvent.blur(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('adds an option on click', async () => {
    const result = jest.fn(() => ({
      data: {
        radioOptionBlockCreate: {
          id: 'radioOption.id',
          parentBlockId: 'radioQuestion.id',
          parentOrder: 0,
          journeyId: 'journeyId',
          label: 'Option 12'
        }
      }
    }))

    const { getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_OPTION_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  parentBlockId: 'radioQuestion.id',
                  label: 'Option 12'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
          <EditorProvider>
            <RadioQuestionEdit
              {...props([
                option,
                option,
                option,
                option,
                option,
                option,
                option,
                option,
                option,
                option,
                option
              ])}
            />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const buttons = getAllByRole('button')
    expect(buttons).toHaveLength(12)
    expect(buttons[11]).toHaveTextContent('Add New Option')

    fireEvent.click(buttons[11])
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('hides add option button if over 11 options', async () => {
    const { getAllByRole } = render(
      <MockedProvider mocks={[]}>
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
          <EditorProvider>
            <RadioQuestionEdit
              {...props([
                option,
                option,
                option,
                option,
                option,
                option,
                option,
                option,
                option,
                option,
                option,
                option
              ])}
            />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const buttons = getAllByRole('button')
    expect(buttons).toHaveLength(12)
    expect(buttons[11]).toHaveTextContent('test label')
  })
})
