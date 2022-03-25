import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { RadioQuestionFields } from '../../../../../../__generated__/RadioQuestionFields'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../../../libs/context'
import { RadioQuestionEdit, RADIO_QUESTION_BLOCK_UPDATE_CONTENT } from '.'

describe('RadioQuestionEdit', () => {
  const props: TreeBlock<RadioQuestionFields> = {
    __typename: 'RadioQuestionBlock',
    parentBlockId: 'card.id',
    parentOrder: 0,
    id: 'radioQuestion.id',
    label: 'heading',
    description: 'description',
    children: []
  }
  it('selects the heading input on click', () => {
    const { getAllByRole } = render(
      <MockedProvider>
        <RadioQuestionEdit {...props} />
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
            <RadioQuestionEdit {...props} />
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

  it('selects the description input on click', async () => {
    const { getAllByRole } = render(
      <MockedProvider>
        <RadioQuestionEdit {...props} />
      </MockedProvider>
    )
    const descriptionInput = getAllByRole('textbox')[1]
    fireEvent.click(descriptionInput)
    expect(descriptionInput).toHaveFocus()
    expect(descriptionInput).toHaveAttribute(
      'placeholder',
      'Type your description here...'
    )
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
            <RadioQuestionEdit {...props} />
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
})
