import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { ComponentProps } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { RadioOptionFields } from '../../../../../../__generated__/RadioOptionFields'

import { RADIO_OPTION_BLOCK_CREATE } from './RadioQuestionEdit'

import { RadioQuestionEdit } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('RadioQuestionEdit', () => {
  const props = (
    children?: Array<TreeBlock<RadioOptionFields>>
  ): ComponentProps<typeof RadioQuestionEdit> => {
    return {
      __typename: 'RadioQuestionBlock',
      parentBlockId: 'card.id',
      parentOrder: 0,
      id: 'radioQuestion.id',
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
          label: ''
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
                  label: ''
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
            variant: 'admin'
          }}
        >
          <EditorProvider>
            <RadioQuestionEdit
              {...props([
                option,
                { ...option, id: 'option1.id' },
                { ...option, id: 'option2.id' },
                { ...option, id: 'option3.id' },
                { ...option, id: 'option4.id' },
                { ...option, id: 'option5.id' },
                { ...option, id: 'option6.id' },
                { ...option, id: 'option7.id' },
                { ...option, id: 'option8.id' },
                { ...option, id: 'option9.id' },
                { ...option, id: 'option10.id' }
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
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider>
            <RadioQuestionEdit
              {...props([
                option,
                { ...option, id: 'option1.id' },
                { ...option, id: 'option2.id' },
                { ...option, id: 'option3.id' },
                { ...option, id: 'option4.id' },
                { ...option, id: 'option5.id' },
                { ...option, id: 'option6.id' },
                { ...option, id: 'option7.id' },
                { ...option, id: 'option8.id' },
                { ...option, id: 'option9.id' },
                { ...option, id: 'option10.id' },
                { ...option, id: 'option11.id' }
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
