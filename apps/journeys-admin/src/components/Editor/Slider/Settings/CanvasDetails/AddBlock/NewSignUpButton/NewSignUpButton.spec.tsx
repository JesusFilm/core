import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import type { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { deleteBlockMock as deleteBlock } from '../../../../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { useBlockRestoreMutationMock as blockRestore } from '../../../../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { SIGN_UP_BLOCK_CREATE } from './NewSignUpButton'

import { NewSignUpButton } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('NewSignUpButton', () => {
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
        coverBlockId: null,
        parentOrder: 0,
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
    mockUuidv4.mockReturnValueOnce('signUpBlockId')
    mockUuidv4.mockReturnValueOnce('iconId')

    const result = jest.fn(() => ({
      data: {
        signUpBlockCreate: {
          id: 'signUpBlockId'
        },
        submitIcon: {
          id: 'iconId',
          journeyId: 'journeyId',
          parentBlockId: 'signUpBlockId',
          name: null
        },
        signUpBlockUpdate: {
          id: 'signUpBlockId',
          parentBlockId: 'cardId',
          journeyId: 'journeyId',
          submitIconId: 'iconId',
          submitLabel: 'Submit',
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
              query: SIGN_UP_BLOCK_CREATE,
              variables: {
                input: {
                  id: 'signUpBlockId',
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',

                  submitLabel: 'Submit'
                },
                iconBlockCreateInput: {
                  id: 'iconId',
                  journeyId: 'journeyId',
                  parentBlockId: 'signUpBlockId',
                  name: null
                },
                id: 'signUpBlockId',
                journeyId: 'journeyId',
                updateInput: {
                  submitIconId: 'iconId'
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
          <EditorProvider initialState={{ selectedStep }}>
            <NewSignUpButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should undo on undo click', async () => {
    mockUuidv4.mockReturnValueOnce('signUpBlockId')
    mockUuidv4.mockReturnValueOnce('iconId')

    const result = jest.fn(() => ({
      data: {
        signUpBlockCreate: {
          id: 'signUpBlockId',
          __typename: 'SignUpBlock',
          parentBlockId: 'cardId'
        },
        submitIcon: {
          id: 'iconId',
          journeyId: 'journeyId',
          parentBlockId: 'signUpBlockId',
          name: null
        },
        signUpBlockUpdate: {
          id: 'signUpBlockId',
          parentBlockId: 'cardId',
          journeyId: 'journeyId',
          submitIconId: 'iconId',
          submitLabel: 'Submit',
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
          id: 'signUpBlockId'
        }
      },
      result: deleteResult
    }
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: SIGN_UP_BLOCK_CREATE,
              variables: {
                input: {
                  id: 'signUpBlockId',
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  submitLabel: 'Submit'
                },
                iconBlockCreateInput: {
                  id: 'iconId',
                  journeyId: 'journeyId',
                  parentBlockId: 'signUpBlockId',
                  name: null
                },
                id: 'signUpBlockId',
                journeyId: 'journeyId',
                updateInput: {
                  submitIconId: 'iconId'
                }
              }
            },
            result
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
            <NewSignUpButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Subscribe' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteResult).toHaveBeenCalled())
  })

  it('should redo on redo click', async () => {
    mockUuidv4.mockReturnValueOnce('signUpBlockId')
    mockUuidv4.mockReturnValueOnce('iconId')

    const result = jest.fn(() => ({
      data: {
        signUpBlockCreate: {
          id: 'signUpBlockId',
          __typename: 'SignUpBlock'
        },
        submitIcon: {
          id: 'iconId',
          journeyId: 'journeyId',
          parentBlockId: 'signUpBlockId',
          name: null
        },
        signUpBlockUpdate: {
          id: 'signUpBlockId',
          parentBlockId: 'cardId',
          journeyId: 'journeyId',
          submitIconId: 'iconId',
          submitLabel: 'Submit',
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
          id: 'signUpBlockId'
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
        variables: { id: 'signUpBlockId' }
      },
      result: restoreResult
    }
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: SIGN_UP_BLOCK_CREATE,
              variables: {
                input: {
                  id: 'signUpBlockId',
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',

                  submitLabel: 'Submit'
                },
                iconBlockCreateInput: {
                  id: 'iconId',
                  journeyId: 'journeyId',
                  parentBlockId: 'signUpBlockId',
                  name: null
                },
                id: 'signUpBlockId',
                journeyId: 'journeyId',
                updateInput: {
                  submitIconId: 'iconId'
                }
              }
            },
            result
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
            <CommandRedoItem variant="button" />
            <CommandUndoItem variant="button" />
            <NewSignUpButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Subscribe' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteResult).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(restoreResult).toHaveBeenCalled())
  })

  it('should update the cache', async () => {
    mockUuidv4.mockReturnValueOnce('signUpBlockId')
    mockUuidv4.mockReturnValueOnce('iconId')

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
        signUpBlockCreate: {
          __typename: 'SignUpBlock',
          id: 'signUpBlockId'
        },
        submitIcon: {
          __typename: 'IconBlock',
          id: 'iconId',
          journeyId: 'journeyId',
          parentBlockId: 'signUpBlockId',
          parentOrder: null,
          iconName: null,
          iconColor: null,
          iconSize: null
        },
        signUpBlockUpdate: {
          __typename: 'SignUpBlock',
          id: 'signUpBlockId',
          parentBlockId: 'cardId',
          parentOrder: 0,
          journeyId: 'journeyId',
          submitIconId: 'iconId',
          submitLabel: 'Submit',
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
              query: SIGN_UP_BLOCK_CREATE,
              variables: {
                input: {
                  id: 'signUpBlockId',
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  submitLabel: 'Submit'
                },
                iconBlockCreateInput: {
                  id: 'iconId',
                  journeyId: 'journeyId',
                  parentBlockId: 'signUpBlockId',
                  name: null
                },
                id: 'signUpBlockId',
                journeyId: 'journeyId',
                updateInput: {
                  submitIconId: 'iconId'
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
          <EditorProvider initialState={{ selectedStep }}>
            <NewSignUpButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'VideoBlock:videoBlockId' },
      { __ref: 'IconBlock:iconId' },
      { __ref: 'SignUpBlock:signUpBlockId' }
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
            <NewSignUpButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('button')).toBeDisabled()
  })
})
