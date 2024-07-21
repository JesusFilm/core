import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import type { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { deleteBlockMock as deleteBlock } from '../../../../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { useBlockRestoreMutationMock as blockRestore } from '../../../../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'

import { TYPOGRAPHY_BLOCK_CREATE } from './NewTypographyButton'

import { NewTypographyButton } from '.'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('NewTypographyButton', () => {
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
        coverBlockId: null,
        parentOrder: 0,
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
        typographyBlockCreate: {
          id: 'typographyBlockId',
          parentBlockId: 'cardId',
          journeyId: 'journeyId',
          align: null,
          color: null,
          content: null,
          variant: null
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
                  content: '',
                  variant: 'h1'
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
            <NewTypographyButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should undo if undo is clicked', async () => {
    const result = jest.fn(() => ({
      data: {
        typographyBlockCreate: {
          id: 'typographyBlockId',
          parentBlockId: 'cardId',
          journeyId: 'journeyId',
          align: null,
          color: null,
          content: null,
          variant: null
        }
      }
    }))

    const deleteResult = jest.fn().mockResolvedValue({ ...deleteBlock.result })
    const deleteBlockMock = {
      ...deleteBlock,
      request: {
        ...deleteBlock.request,
        variables: {
          id: 'typographyBlockId',
          journeyId: 'journeyId',
          parentBlockId: 'cardId'
        }
      },
      result: deleteResult
    }
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
                  content: '',
                  variant: 'h1'
                }
              }
            },
            result
          },
          {
            ...deleteBlockMock,
            result: deleteResult
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
            <CommandUndoItem variant="button" />
            <NewTypographyButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Text' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteResult).toHaveBeenCalled())
  })

  it('should redo if redo is clicked', async () => {
    const result = jest.fn(() => ({
      data: {
        typographyBlockCreate: {
          id: 'typographyBlockId',
          parentBlockId: 'cardId',
          journeyId: 'journeyId',
          align: null,
          color: null,
          content: null,
          variant: null
        }
      }
    }))

    const deleteResult = jest.fn().mockResolvedValue({ ...deleteBlock.result })
    const deleteBlockMock = {
      ...deleteBlock,
      request: {
        ...deleteBlock.request,
        variables: {
          id: 'typographyBlockId',
          journeyId: 'journeyId',
          parentBlockId: 'cardId'
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
        variables: { blockRestoreId: 'typographyBlockId' }
      },
      result: restoreResult
    }
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
                  content: '',
                  variant: 'h1'
                }
              }
            },
            result
          },
          {
            ...deleteBlockMock,
            result: deleteResult
          },
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
            <NewTypographyButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Text' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
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
    const result = jest.fn(() => ({
      data: {
        typographyBlockCreate: {
          id: 'typographyBlockId',
          parentBlockId: 'cardId',
          journeyId: 'journeyId',
          parentOrder: 0,
          align: null,
          color: null,
          content: null,
          variant: null,
          __typename: 'TypographyBlock'
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
                  content: '',
                  variant: 'h1'
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
            <NewTypographyButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'VideoBlock:videoBlockId' },
      { __ref: 'TypographyBlock:typographyBlockId' }
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
            <NewTypographyButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('button')).toBeDisabled()
  })
})
