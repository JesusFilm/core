import { MockedProvider } from '@apollo/client/testing'
import { InMemoryCache } from '@apollo/client'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { JourneyProvider } from '../../../../../libs/context'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { TYPOGRAPHY_BLOCK_CREATE } from '../NewTypographyButton'
import { RADIO_QUESTION_BLOCK_CREATE } from './NewRadioQuestionButton'

import { NewRadioQuestionButton } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: () => 'uuid'
}))

describe('RadioQuestion', () => {
  const selectedStep: TreeBlock = {
    __typename: 'StepBlock',
    id: 'stepId',
    parentBlockId: null,
    parentOrder: 0,
    locked: true,
    nextBlockId: null,
    children: [
      {
        id: 'cardId',
        __typename: 'CardBlock',
        parentBlockId: 'stepId',
        parentOrder: 0,
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
    const titleCreateResult = jest.fn(() => ({
      data: {
        typographyBlockCreate: {
          id: 'typographyId.1',
          parentBlockId: 'cardId',
          parentOrder: 0,
          content: 'Your Question Here?',
          align: null,
          color: null,
          variant: 'h3'
        }
      }
    }))

    const descriptionCreateResult = jest.fn(() => ({
      data: {
        typographyBlockCreate: {
          id: 'typographyId.2',
          parentBlockId: 'cardId',
          parentOrder: 1,
          content: 'Your Description Here',
          align: null,
          color: null,
          variant: 'body2'
        }
      }
    }))

    const radioCreateResult = jest.fn(() => ({
      data: {
        radioQuestionBlockCreate: {
          __typename: 'RadioQuestionBlock',
          id: 'uuid',
          parentBlockId: 'cardId',
          parentOrder: 2,
          journeyId: 'journeyId',
          label: '',
          description: null
        },
        radioOption1: {
          __typename: 'RadioOptionBlock',
          id: 'radioOptionBlockId1',
          parentBlockId: 'uuid',
          parentOrder: 0,
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
          parentOrder: 1,
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
              query: TYPOGRAPHY_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  content: 'Your Question Here?',
                  variant: 'h3'
                }
              }
            },
            result: titleCreateResult
          },
          {
            request: {
              query: TYPOGRAPHY_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  content: 'Your Description Here',
                  variant: 'body2'
                }
              }
            },
            result: descriptionCreateResult
          },
          {
            request: {
              query: RADIO_QUESTION_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  id: 'uuid',
                  parentBlockId: 'cardId',
                  label: ''
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
            result: radioCreateResult
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
    await waitFor(() => expect(titleCreateResult).toHaveBeenCalled())
    await waitFor(() => expect(descriptionCreateResult).toHaveBeenCalled())
    await waitFor(() => expect(radioCreateResult).toHaveBeenCalled())
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

    const titleCreateResult = jest.fn(() => ({
      data: {
        typographyBlockCreate: {
          id: 'typographyId.1',
          parentBlockId: 'cardId',
          parentOrder: 0,
          content: 'Your Question Here?',
          align: null,
          color: null,
          variant: 'h3',
          __typename: 'TypographyBlock'
        }
      }
    }))

    const descriptionCreateResult = jest.fn(() => ({
      data: {
        typographyBlockCreate: {
          id: 'typographyId.2',
          parentBlockId: 'cardId',
          parentOrder: 1,
          content: 'Your Description Here',
          align: null,
          color: null,
          variant: 'body2',
          __typename: 'TypographyBlock'
        }
      }
    }))

    const radioCreateResult = jest.fn(() => ({
      data: {
        radioQuestionBlockCreate: {
          __typename: 'RadioQuestionBlock',
          id: 'uuid',
          parentBlockId: 'cardId',
          parentOrder: 2,
          journeyId: 'journeyId',
          label: '',
          description: null
        },
        radioOption1: {
          __typename: 'RadioOptionBlock',
          id: 'radioOptionBlockId1',
          parentBlockId: 'uuid',
          parentOrder: 0,
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
          parentOrder: 1,
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
              query: TYPOGRAPHY_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  content: 'Your Question Here?',
                  variant: 'h3'
                }
              }
            },
            result: titleCreateResult
          },
          {
            request: {
              query: TYPOGRAPHY_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  content: 'Your Description Here',
                  variant: 'body2'
                }
              }
            },
            result: descriptionCreateResult
          },
          {
            request: {
              query: RADIO_QUESTION_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  id: 'uuid',
                  parentBlockId: 'cardId',
                  label: ''
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
            result: radioCreateResult
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
    await waitFor(() => expect(titleCreateResult).toHaveBeenCalled())
    await waitFor(() => expect(descriptionCreateResult).toHaveBeenCalled())
    await waitFor(() => expect(radioCreateResult).toHaveBeenCalled())

    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'VideoBlock:videoBlockId' },
      { __ref: 'TypographyBlock:typographyId.1' },
      { __ref: 'TypographyBlock:typographyId.2' },
      { __ref: 'RadioQuestionBlock:uuid' },
      { __ref: 'RadioOptionBlock:radioOptionBlockId1' },
      { __ref: 'RadioOptionBlock:radioOptionBlockId2' }
    ])
  })
})
