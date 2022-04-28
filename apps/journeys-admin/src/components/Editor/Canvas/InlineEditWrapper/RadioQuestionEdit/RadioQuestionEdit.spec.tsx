import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { RadioOptionFields } from '../../../../../../__generated__/RadioOptionFields'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../../../libs/context'
import {
  RadioQuestionEditProps,
  RADIO_OPTION_BLOCK_CREATE
} from './RadioQuestionEdit'
import { RadioQuestionEdit } from '.'

describe('RadioQuestionEdit', () => {
  const props = (
    children?: Array<TreeBlock<RadioOptionFields>>
  ): RadioQuestionEditProps => {
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
