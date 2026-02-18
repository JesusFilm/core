import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import type { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { deleteBlockMock as deleteBlock } from '../../../../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { useBlockRestoreMutationMock as blockRestore } from '../../../../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { RADIO_QUESTION_BLOCK_CREATE } from './NewRadioQuestionButton'

import { NewRadioQuestionButton } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: () => 'uuid'
}))

describe('NewRadioQuestionButton', () => {
  const selectedStep: TreeBlock = {
    __typename: 'StepBlock',
    id: 'stepId',
    parentBlockId: null,
    parentOrder: 0,
    locked: true,
    nextBlockId: null,
    slug: null,
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
        backdropBlur: null,
        children: []
      }
    ]
  }

  it('should check if the mutation gets called', async () => {
    const radioCreateResult = jest.fn(() => ({
      data: {
        radioQuestionBlockCreate: {
          __typename: 'RadioQuestionBlock',
          id: 'uuid',
          parentBlockId: 'cardId',
          parentOrder: 2,
          journeyId: 'journeyId'
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
              query: RADIO_QUESTION_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  id: 'uuid',
                  parentBlockId: 'cardId'
                },
                radioOptionBlockCreateInput1: {
                  id: 'uuid',
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  label: 'Option 1'
                },
                radioOptionBlockCreateInput2: {
                  id: 'uuid',
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
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <NewRadioQuestionButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(radioCreateResult).toHaveBeenCalled())
  })

  it('should undo if undo is clicked', async () => {
    const radioCreateResult = jest.fn(() => ({
      data: {
        radioQuestionBlockCreate: {
          __typename: 'RadioQuestionBlock',
          id: 'uuid',
          parentBlockId: 'cardId',
          parentOrder: 2,
          journeyId: 'journeyId'
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

    const deleteResult = jest.fn().mockResolvedValue({ ...deleteBlock.result })
    const deleteBlockMock = {
      ...deleteBlock,
      request: {
        ...deleteBlock.request,
        variables: {
          id: 'uuid'
        }
      },
      result: deleteResult
    }

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
                  parentBlockId: 'cardId'
                },
                radioOptionBlockCreateInput1: {
                  id: 'uuid',
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  label: 'Option 1'
                },
                radioOptionBlockCreateInput2: {
                  id: 'uuid',
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  label: 'Option 2'
                }
              }
            },
            result: radioCreateResult
          },
          { ...deleteBlockMock, result: deleteResult }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <CommandUndoItem variant="button" />
            <NewRadioQuestionButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Poll' }))
    await waitFor(() => expect(radioCreateResult).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteResult).toHaveBeenCalled())
  })

  it('should redo if redo is clicked', async () => {
    const radioCreateResult = jest.fn(() => ({
      data: {
        radioQuestionBlockCreate: {
          __typename: 'RadioQuestionBlock',
          id: 'uuid',
          parentBlockId: 'cardId',
          parentOrder: 2,
          journeyId: 'journeyId'
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

    const deleteResult = jest.fn().mockResolvedValue({ ...deleteBlock.result })
    const deleteBlockMock = {
      ...deleteBlock,
      request: {
        ...deleteBlock.request,
        variables: {
          id: 'uuid'
        }
      },
      result: deleteResult
    }

    const restoreResult = jest
      .fn()
      .mockResolvedValue({ ...blockRestore.result })

    const blockRestoreMock = {
      ...blockRestore,
      request: {
        ...blockRestore.request,
        variables: { id: 'uuid' }
      },
      result: restoreResult
    }

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
                  parentBlockId: 'cardId'
                },
                radioOptionBlockCreateInput1: {
                  id: 'uuid',
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  label: 'Option 1'
                },
                radioOptionBlockCreateInput2: {
                  id: 'uuid',
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  label: 'Option 2'
                }
              }
            },
            result: radioCreateResult
          },
          { ...deleteBlockMock, result: deleteResult },
          { ...blockRestoreMock, result: restoreResult }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
            <NewRadioQuestionButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Poll' }))
    await waitFor(() => expect(radioCreateResult).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteResult).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(restoreResult).toHaveBeenCalled())
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

    const radioCreateResult = jest.fn(() => ({
      data: {
        radioQuestionBlockCreate: {
          __typename: 'RadioQuestionBlock',
          id: 'uuid',
          parentBlockId: 'cardId',
          parentOrder: 2,
          journeyId: 'journeyId'
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
              query: RADIO_QUESTION_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  id: 'uuid',
                  parentBlockId: 'cardId'
                },
                radioOptionBlockCreateInput1: {
                  id: 'uuid',
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  label: 'Option 1'
                },
                radioOptionBlockCreateInput2: {
                  id: 'uuid',
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
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <NewRadioQuestionButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(radioCreateResult).toHaveBeenCalled())

    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'VideoBlock:videoBlockId' },
      { __ref: 'RadioQuestionBlock:uuid' },
      { __ref: 'RadioOptionBlock:radioOptionBlockId1' },
      { __ref: 'RadioOptionBlock:radioOptionBlockId2' }
    ])
  })

  it('should disable when loading', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <NewRadioQuestionButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('button')).toBeDisabled()
  })
})
