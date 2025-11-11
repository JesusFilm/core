import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { ComponentProps } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { MultiselectOptionFields } from '../../../../../../../../__generated__/MultiselectOptionFields'
import { deleteBlockMock } from '../../../../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { useBlockRestoreMutationMock as blockRestoreMock } from '../../../../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { MULTISELECT_OPTION_BLOCK_CREATE } from './MultiselectQuestionEdit'

import { MultiselectQuestionEdit } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('uuid', () => ({
  v4: () => 'multiselectOption.id'
}))

describe('MultiselectQuestionEdit', () => {
  const props = (
    children?: Array<TreeBlock<MultiselectOptionFields>>
  ): ComponentProps<typeof MultiselectQuestionEdit> => {
    return {
      __typename: 'MultiselectBlock',
      parentBlockId: 'card.id',
      parentOrder: 0,
      id: 'multiselectQuestion.id',
      min: null,
      max: null,
      children: children ?? []
    }
  }

  const option: TreeBlock<MultiselectOptionFields> = {
    __typename: 'MultiselectOptionBlock',
    id: 'option.id',
    label: 'test label',
    parentBlockId: 'card',
    parentOrder: 0,
    children: []
  }

  it('adds an option on click', async () => {
    const result = jest.fn(() => ({
      data: {
        multiselectOptionBlockCreate: {
          id: 'multiselectOption.id',
          parentBlockId: 'multiselectQuestion.id',
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
              query: MULTISELECT_OPTION_BLOCK_CREATE,
              variables: {
                input: {
                  id: 'multiselectOption.id',
                  journeyId: 'journeyId',
                  parentBlockId: 'multiselectQuestion.id',
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
            <MultiselectQuestionEdit
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
    expect(buttons[11]).toHaveTextContent('Add Option')

    fireEvent.click(buttons[11])
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('can undo an option create', async () => {
    const result = jest.fn(() => ({
      data: {
        multiselectOptionBlockCreate: {
          id: 'multiselectOption.id',
          parentBlockId: 'multiselectQuestion.id',
          parentOrder: 0,
          journeyId: 'journeyId',
          label: ''
        }
      }
    }))

    const blockDeleteResult = jest.fn().mockReturnValue(deleteBlockMock.result)

    const { getAllByRole, getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: MULTISELECT_OPTION_BLOCK_CREATE,
              variables: {
                input: {
                  id: 'multiselectOption.id',
                  journeyId: 'journeyId',
                  parentBlockId: 'multiselectQuestion.id',
                  label: ''
                }
              }
            },
            result
          },
          {
            request: {
              ...deleteBlockMock.request,
              variables: { id: 'multiselectOption.id' }
            },
            result: blockDeleteResult
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
            <MultiselectQuestionEdit
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
            <CommandUndoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const buttons = getAllByRole('button')
    expect(buttons[11]).toHaveTextContent('Add Option')

    fireEvent.click(buttons[11])
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(blockDeleteResult).toHaveBeenCalled())
  })

  it('can redo an option create', async () => {
    const result = jest.fn(() => ({
      data: {
        multiselectOptionBlockCreate: {
          id: 'multiselectOption.id',
          parentBlockId: 'multiselectQuestion.id',
          parentOrder: 0,
          journeyId: 'journeyId',
          label: ''
        }
      }
    }))

    const blockDeleteResult = jest.fn().mockReturnValue(deleteBlockMock.result)
    const blockRestoreResult = jest
      .fn()
      .mockReturnValue(blockRestoreMock.result)

    const { getAllByRole, getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: MULTISELECT_OPTION_BLOCK_CREATE,
              variables: {
                input: {
                  id: 'multiselectOption.id',
                  journeyId: 'journeyId',
                  parentBlockId: 'multiselectQuestion.id',
                  label: ''
                }
              }
            },
            result
          },
          {
            request: {
              ...deleteBlockMock.request,
              variables: { id: 'multiselectOption.id' }
            },
            result: blockDeleteResult
          },
          {
            request: {
              ...blockRestoreMock.request,
              variables: { id: 'multiselectOption.id' }
            },
            result: blockRestoreResult
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
            <MultiselectQuestionEdit
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
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const buttons = getAllByRole('button')
    expect(buttons[11]).toHaveTextContent('Add Option')

    fireEvent.click(buttons[11])
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(blockDeleteResult).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(blockRestoreResult).toHaveBeenCalled())
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
            <MultiselectQuestionEdit
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
