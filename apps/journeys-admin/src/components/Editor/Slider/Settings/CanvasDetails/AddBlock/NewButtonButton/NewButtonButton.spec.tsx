import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  ButtonBlockCreate,
  ButtonBlockCreateVariables
} from '../../../../../../../../__generated__/ButtonBlockCreate'
import type { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../__generated__/globalTypes'
import { deleteBlockMock as deleteBlock } from '../../../../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { useBlockRestoreMutationMock as blockRestore } from '../../../../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { BUTTON_BLOCK_CREATE } from './NewButtonButton'

import { NewButtonButton } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('NewButtonButton', () => {
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

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const buttonBlockCreateMock: MockedResponse<
    ButtonBlockCreate,
    ButtonBlockCreateVariables
  > = {
    request: {
      query: BUTTON_BLOCK_CREATE,
      variables: {
        input: {
          id: 'buttonBlockId',
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          label: '',
          variant: ButtonVariant.contained,
          color: ButtonColor.primary,
          size: ButtonSize.medium
        },
        iconBlockCreateInput1: {
          id: 'startIconId',
          journeyId: 'journeyId',
          parentBlockId: 'buttonBlockId',
          name: null
        },
        iconBlockCreateInput2: {
          id: 'endIconId',
          journeyId: 'journeyId',
          parentBlockId: 'buttonBlockId',
          name: null
        },
        id: 'buttonBlockId',
        journeyId: 'journeyId',
        updateInput: {
          startIconId: 'startIconId',
          endIconId: 'endIconId'
        }
      }
    },
    result: {
      data: {
        buttonBlockCreate: {
          __typename: 'ButtonBlock',
          id: 'buttonBlockId'
        },
        startIcon: {
          __typename: 'IconBlock',
          id: 'startIconId',
          parentBlockId: 'buttonBlockId',
          parentOrder: null,
          iconName: null,
          iconColor: null,
          iconSize: null
        },
        endIcon: {
          __typename: 'IconBlock',
          id: 'endIconId',
          parentBlockId: 'buttonBlockId',
          parentOrder: null,
          iconName: null,
          iconColor: null,
          iconSize: null
        },
        buttonBlockUpdate: {
          __typename: 'ButtonBlock',
          id: 'buttonBlockId',
          parentBlockId: 'cardId',
          parentOrder: 0,
          label: '',
          buttonVariant: ButtonVariant.contained,
          buttonColor: ButtonColor.primary,
          size: ButtonSize.medium,
          startIconId: 'startIconId',
          endIconId: 'endIconId',
          action: null
        }
      } as unknown as ButtonBlockCreate
    }
  }

  const result = jest.fn(() => ({ ...buttonBlockCreateMock.result }))

  it('should check if the mutation gets called', async () => {
    mockUuidv4.mockReturnValueOnce('buttonBlockId')
    mockUuidv4.mockReturnValueOnce('startIconId')
    mockUuidv4.mockReturnValueOnce('endIconId')

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            ...buttonBlockCreateMock,
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
            <NewButtonButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should remove block if undo clicked', async () => {
    mockUuidv4.mockReturnValueOnce('buttonBlockId')
    mockUuidv4.mockReturnValueOnce('startIconId')
    mockUuidv4.mockReturnValueOnce('endIconId')

    const deleteResult = jest.fn().mockResolvedValue({ ...deleteBlock.result })
    const deleteBlockMock = {
      ...deleteBlock,
      request: {
        ...deleteBlock.request,
        variables: {
          id: 'buttonBlockId'
        }
      },
      result: deleteResult
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            ...buttonBlockCreateMock,
            result
          },
          deleteBlockMock
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
            <NewButtonButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Button' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteResult).toHaveBeenCalled())
  })

  it('should restore block if redo clicked', async () => {
    mockUuidv4.mockReturnValueOnce('buttonBlockId')
    mockUuidv4.mockReturnValueOnce('startIconId')
    mockUuidv4.mockReturnValueOnce('endIconId')

    const deleteResult = jest.fn().mockResolvedValue({ ...deleteBlock.result })
    const deleteBlockMock = {
      ...deleteBlock,
      request: {
        ...deleteBlock.request,
        variables: {
          id: 'buttonBlockId'
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
        variables: { id: 'buttonBlockId' }
      },
      result: restoreResult
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            ...buttonBlockCreateMock,
            result
          },
          deleteBlockMock,
          blockRestoreMock
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
            <NewButtonButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Button' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteResult).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(restoreResult).toHaveBeenCalled())
  })

  it('should update the cache', async () => {
    mockUuidv4.mockReturnValueOnce('buttonBlockId')
    mockUuidv4.mockReturnValueOnce('startIconId')
    mockUuidv4.mockReturnValueOnce('endIconId')

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
            ...buttonBlockCreateMock,
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
            <NewButtonButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'TypographyBlock:typographyBlockId' },
      { __ref: 'IconBlock:startIconId' },
      { __ref: 'IconBlock:endIconId' },
      { __ref: 'ButtonBlock:buttonBlockId' }
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
            <NewButtonButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('button')).toBeDisabled()
  })
})
