import { MockedProvider } from '@apollo/client/testing'
import { InMemoryCache } from '@apollo/client'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { JourneyProvider } from '../../../../../libs/context'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { RADIO_QUESTION_BLOCK_CREATE } from './NewRadioQuestionButton'
import { NewRadioQuestionButton } from '.'

describe('RadioQuestion', () => {
  const selectedStep: TreeBlock = {
    __typename: 'StepBlock',
    id: 'stepId',
    parentBlockId: null,
    locked: true,
    nextBlockId: null,
    children: [
      {
        id: 'cardId',
        __typename: 'CardBlock',
        parentBlockId: 'stepId',
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: []
      }
    ]
  }

  it('should check if the mutation gets called', async () => {
    const result = jest.fn(() => ({
      data: {
        radioQuestionBlockCreate: {
          __typename: 'RadioQuestionBlock',
          id: 'uuid',
          parentBlockId: 'cardId',
          journeyId: 'journeyId',
          label: 'Your Question Here?',
          description: null
        },
        radioOption1: {
          __typename: 'RadioOptionBlock',
          id: 'radioOptionBlockId1',
          parentBlockId: 'uuid',
          journeyId: 'journeyId',
          label: 'Option 1',
          action: {
            __typename: 'NavigateToBlockAction',
            gtmEventName: 'gtmEventName',
            blockId: 'def'
          }
        },
        radioOption2: {
          __typename: 'RadioOptionBlock',
          id: 'radioOptionBlockId2',
          parentBlockId: 'uuid',
          journeyId: 'journeyId',
          label: 'Option 2',
          action: {
            __typename: 'NavigateToBlockAction',
            gtmEventName: 'gtmEventName',
            blockId: 'def'
          }
        }
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_QUESTION_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  id: 'uuid',
                  parentBlockId: 'cardId',
                  label: 'Your Question Here?'
                },
                radioOptionBlockCreateInput1: {
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  label: 'Option 1'
                },
                radioOptionBlockCreateInput2: {
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  label: 'Option 2'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
          <EditorProvider initialState={{ selectedStep }}>
            <NewRadioQuestionButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should update the cache', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'VideoBlock:videoBlockId' }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })
    const result = jest.fn(() => ({
      data: {
        radioQuestionBlockCreate: {
          __typename: 'RadioQuestionBlock',
          id: 'uuid',
          parentBlockId: 'cardId',
          journeyId: 'journeyId',
          label: 'Your Question Here?',
          description: null
        },
        radioOption1: {
          __typename: 'RadioOptionBlock',
          id: 'radioOptionBlockId1',
          parentBlockId: 'uuid',
          journeyId: 'journeyId',
          label: 'Option 1',
          action: {
            __typename: 'NavigateToBlockAction',
            gtmEventName: 'gtmEventName',
            blockId: 'def'
          }
        },
        radioOption2: {
          __typename: 'RadioOptionBlock',
          id: 'radioOptionBlockId2',
          parentBlockId: 'uuid',
          journeyId: 'journeyId',
          label: 'Option 2',
          action: {
            __typename: 'NavigateToBlockAction',
            gtmEventName: 'gtmEventName',
            blockId: 'def'
          }
        }
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: RADIO_QUESTION_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  id: 'uuid',
                  parentBlockId: 'cardId',
                  label: 'Your Question Here?'
                },
                radioOptionBlockCreateInput1: {
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  label: 'Option 1'
                },
                radioOptionBlockCreateInput2: {
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  label: 'Option 2'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
          <EditorProvider initialState={{ selectedStep }}>
            <NewRadioQuestionButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'VideoBlock:videoBlockId' },
      { __ref: 'RadioQuestionBlock:uuid' },
      { __ref: 'RadioOptionBlock:radioOptionBlockId1' },
      { __ref: 'RadioOptionBlock:radioOptionBlockId2' }
    ])
  })
})
