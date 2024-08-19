import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  FormBlockCreate,
  FormBlockCreateVariables
} from '../../../../../../../../__generated__/FormBlockCreate'
import type { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { deleteBlockMock as deleteBlock } from '../../../../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { useBlockRestoreMutationMock as blockRestore } from '../../../../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { FORM_BLOCK_CREATE } from './NewFormButton'

import { NewFormButton } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: () => 'formBlockId'
}))

describe('NewFormButton', () => {
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

  const formBlockCreateMock: MockedResponse<
    FormBlockCreate,
    FormBlockCreateVariables
  > = {
    request: {
      query: FORM_BLOCK_CREATE,
      variables: {
        input: {
          id: 'formBlockId',
          parentBlockId: 'cardId',
          journeyId: 'journeyId'
        }
      }
    },
    result: {
      data: {
        formBlockCreate: {
          id: 'formBlockId',
          parentBlockId: 'cardId',
          parentOrder: 0,
          form: null,
          action: null,
          __typename: 'FormBlock'
        }
      }
    }
  }

  const result = jest.fn().mockReturnValue(formBlockCreateMock.result)

  beforeEach(() => jest.clearAllMocks())

  it('should create new form block', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            ...formBlockCreateMock,
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
            <NewFormButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should undo form block on undo', async () => {
    const deleteResult = jest.fn().mockReturnValue({ ...deleteBlock.result })
    const deleteBlockMock = {
      ...deleteBlock,
      request: {
        ...deleteBlock.request,
        variables: {
          id: 'formBlockId'
        }
      },
      result: deleteResult
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            ...formBlockCreateMock,
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
            <NewFormButton />
            <CommandUndoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Form' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteResult).toHaveBeenCalled())
  })

  it('should redo form block on redo', async () => {
    const deleteResult = jest.fn().mockReturnValue({ ...deleteBlock.result })
    const deleteBlockMock = {
      ...deleteBlock,
      request: {
        ...deleteBlock.request,
        variables: {
          id: 'formBlockId'
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
        variables: { id: 'formBlockId' }
      },
      result: restoreResult
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            ...formBlockCreateMock,
            result
          },
          {
            ...deleteBlockMock,
            result: deleteResult
          },
          {
            ...blockRestoreMock,
            result: restoreResult
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
            <NewFormButton />
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Form' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteResult).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(restoreResult).toHaveBeenCalled())
  })

  it('should update cache with the new block', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'TypographyBlock:typographyBlockId' }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })

    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            ...formBlockCreateMock,
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
            <NewFormButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'TypographyBlock:typographyBlockId' },
      { __ref: 'FormBlock:formBlockId' }
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
            <NewFormButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('button')).toBeDisabled()
  })
})
