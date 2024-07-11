import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_StepBlock as StepBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../../__generated__/GetJourney'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'
import { deleteBlockMock } from '../../../../../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import useBlockDelete from './useBlockDelete'

describe('useBlockDelete', () => {
  const selectedBlock: TreeBlock<TypographyBlock> = {
    id: 'typography0.id',
    __typename: 'TypographyBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    content: 'Title',
    variant: TypographyVariant.h1,
    color: TypographyColor.primary,
    align: TypographyAlign.center,
    children: []
  }

  const selectedStep: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'stepId',
    parentBlockId: 'journey-id',
    parentOrder: 0,
    locked: true,
    nextBlockId: null,
    children: [
      {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'stepId',
        parentOrder: 0,
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [selectedBlock]
      }
    ]
  }

  it('should delete the selected block', async () => {
    const mockResult = jest.fn().mockReturnValueOnce(deleteBlockMock.result)

    const { result: hook } = renderHook(() => useBlockDelete(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[{ ...deleteBlockMock, result: mockResult }]}>
          <SnackbarProvider>
            <EditorProvider
              initialState={{ selectedBlock, steps: [selectedStep] }}
            >
              <JourneyProvider
                value={{
                  journey: { id: 'journey-id' } as unknown as Journey,
                  variant: 'admin'
                }}
              >
                {children}
              </JourneyProvider>
            </EditorProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
    })

    act(() => hook.current.onDeleteBlock())

    await waitFor(() =>
      expect(mockResult).toHaveBeenCalledWith({
        id: 'typography0.id',
        journeyId: 'journey-id',
        parentBlockId: 'card1.id'
      })
    )
  })
})
