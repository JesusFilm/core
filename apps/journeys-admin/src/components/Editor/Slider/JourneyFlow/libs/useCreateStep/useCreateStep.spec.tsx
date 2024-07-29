import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_StepBlock as StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'
import { TestUseCreateStepHooks } from '../TestUseCreateStepHooks'
import {
  blockDeleteWithStepUpdate,
  blockRestoreWithStepUpdate,
  mockStepBlock,
  stepAndCardBlockCreateWithStepUpdateMock
} from './useCreateStep.mock'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

const step = {
  __typename: 'StepBlock',
  id: 'step.id'
} as unknown as TreeBlock<StepBlock>

// blockOrderUpdateMock.request.variables = {
//   id: 'newStep.id',
//   journeyId: 'journey-id',
//   parentOrder: 0
// }
// blockOrderUpdateMock.result = jest.fn(() => ({
//   data: {
//     blockOrderUpdate: [
//       {
//         __typename: 'StepBlock',
//         id: 'blockId',
//         parentOrder: 0
//       }
//     ]
//   }
// }))

// blockActionNavigateToBlockUpdateMock.request.variables = {
//   id: 'block1.id',
//   input: {
//     blockId: 'newStep.id'
//   }
// }
// blockActionNavigateToBlockUpdateMock.result = jest.fn(() => ({
//   data: {
//     blockUpdateNavigateToBlockAction: {
//       __typename: 'NavigateToBlockAction',
//       parentBlockId: 'step1.id',
//       gtmEventName: null,
//       blockId: 'newStep.id'
//     }
//   }
// }))

// const block = {
//   __typename: 'ButtonBlock',
//   id: 'block1.id',
//   children: []
// } as unknown as TreeBlock<ButtonBlock>

// const step1: TreeBlock<StepBlock> = {
//   id: 'step1.id',
//   __typename: 'StepBlock',
//   parentBlockId: null,
//   parentOrder: 0,
//   locked: false,
//   nextBlockId: null,
//   children: [block]
// }

// const stepBlockNextBlockUpdateMock: MockedResponse<
//   StepBlockNextBlockUpdate,
//   StepBlockNextBlockUpdateVariables
// > = {
//   request: {
//     query: STEP_BLOCK_NEXT_BLOCK_UPDATE,
//     variables: {
//       id: 'step0.id',
//       journeyId: 'journey-id',
//       input: {
//         nextBlockId: 'newStep.id'
//       }
//     }
//   },
//   result: {
//     data: {
//       stepBlockUpdate: {
//         __typename: 'StepBlock',
//         id: 'step0.id',
//         nextBlockId: 'newStep.id'
//       }
//     }
//   }
// }

describe('useCreateStep', () => {
  it('should create a new step block', async () => {
    const cache = new InMemoryCache().restore({
      'Journey:journey-id': {
        blocks: [{ __ref: 'StepBlock:step.id' }],
        id: 'journey-id',
        __typename: 'Journey'
      },
      'StepBlock:step1.id': {
        ...mockStepBlock
      }
    })

    mockUuidv4.mockReturnValueOnce('newStep.id')
    mockUuidv4.mockReturnValueOnce('newCard.id')

    const result = jest
      .fn()
      .mockReturnValue(stepAndCardBlockCreateWithStepUpdateMock.result)

    render(
      <MockedProvider
        mocks={[{ ...stepAndCardBlockCreateWithStepUpdateMock, result }]}
        cache={cache}
      >
        <TestUseCreateStepHooks sourceStep={mockStepBlock} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('useCreateStep'))
    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([
      { __ref: 'StepBlock:step.id' },
      { __ref: 'StepBlock:newStep.id' },
      { __ref: 'CardBlock:newCard.id' }
    ])

    expect(cache.extract()['StepBlock:newStep.id']).toEqual({
      __typename: 'StepBlock',
      id: 'newStep.id',
      locked: false,
      nextBlockId: null,
      parentBlockId: null,
      parentOrder: null,
      x: 777,
      y: 777
    })
    expect(cache.extract()['CardBlock:newCard.id']).toEqual({
      __typename: 'CardBlock',
      id: 'newCard.id',
      parentBlockId: 'newStep.id',
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: null,
      themeMode: 'dark',
      themeName: 'base',
      fullscreen: false
    })
  })

  it('should undo a new step block', async () => {
    const cache = new InMemoryCache().restore({
      'Journey:journey-id': {
        blocks: [{ __ref: 'StepBlock:step.id' }],
        id: 'journey-id',
        __typename: 'Journey'
      },
      'StepBlock:step1.id': {
        ...mockStepBlock
      }
    })

    mockUuidv4.mockReturnValueOnce('newStep.id')
    mockUuidv4.mockReturnValueOnce('newCard.id')

    const result = jest
      .fn()
      .mockReturnValue(stepAndCardBlockCreateWithStepUpdateMock.result)
    const result2 = jest.fn().mockReturnValue(blockDeleteWithStepUpdate.result)

    render(
      <MockedProvider
        mocks={[
          { ...stepAndCardBlockCreateWithStepUpdateMock, result },
          { ...blockDeleteWithStepUpdate, result: result2 }
        ]}
        cache={cache}
      >
        <TestUseCreateStepHooks
          sourceStep={mockStepBlock}
          selectedStep={step}
        />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('useCreateStep'))
    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([
      { __ref: 'StepBlock:step.id' },
      { __ref: 'StepBlock:newStep.id' },
      { __ref: 'CardBlock:newCard.id' }
    ])

    expect(cache.extract()['StepBlock:newStep.id']).toEqual({
      __typename: 'StepBlock',
      id: 'newStep.id',
      locked: false,
      nextBlockId: null,
      parentBlockId: null,
      parentOrder: null,
      x: 777,
      y: 777
    })
    expect(cache.extract()['CardBlock:newCard.id']).toEqual({
      __typename: 'CardBlock',
      id: 'newCard.id',
      parentBlockId: 'newStep.id',
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: null,
      themeMode: 'dark',
      themeName: 'base',
      fullscreen: false
    })

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should redo a new step block', async () => {
    const cache = new InMemoryCache().restore({
      'Journey:journey-id': {
        blocks: [{ __ref: 'StepBlock:step.id' }],
        id: 'journey-id',
        __typename: 'Journey'
      },
      'StepBlock:step1.id': {
        ...mockStepBlock
      }
    })

    mockUuidv4.mockReturnValueOnce('newStep.id')
    mockUuidv4.mockReturnValueOnce('newCard.id')

    const result = jest
      .fn()
      .mockReturnValue(stepAndCardBlockCreateWithStepUpdateMock.result)
    const result2 = jest.fn().mockReturnValue(blockDeleteWithStepUpdate.result)
    const result3 = jest.fn().mockReturnValue(blockRestoreWithStepUpdate.result)

    render(
      <MockedProvider
        mocks={[
          { ...stepAndCardBlockCreateWithStepUpdateMock, result },
          { ...blockDeleteWithStepUpdate, result: result2 },
          { ...blockRestoreWithStepUpdate, result: result3 }
        ]}
        cache={cache}
      >
        <TestUseCreateStepHooks
          sourceStep={mockStepBlock}
          selectedStep={step}
        />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('useCreateStep'))
    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([
      { __ref: 'StepBlock:step.id' },
      { __ref: 'StepBlock:newStep.id' },
      { __ref: 'CardBlock:newCard.id' }
    ])

    expect(cache.extract()['StepBlock:newStep.id']).toEqual({
      __typename: 'StepBlock',
      id: 'newStep.id',
      locked: false,
      nextBlockId: null,
      parentBlockId: null,
      parentOrder: null,
      x: 777,
      y: 777
    })
    expect(cache.extract()['CardBlock:newCard.id']).toEqual({
      __typename: 'CardBlock',
      id: 'newCard.id',
      parentBlockId: 'newStep.id',
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: null,
      themeMode: 'dark',
      themeName: 'base',
      fullscreen: false
    })

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(result3).toHaveBeenCalled())
  })

  // it('should update block order for SocialPreview edge', async () => {
  //   mockUuidv4.mockReturnValueOnce('newStep.id')
  //   mockUuidv4.mockReturnValueOnce('newCard.id')

  //   const { result: hook } = renderHook(() => useCreateStep(), {
  //     wrapper: ({ children }) => (
  //       <MockedProvider
  //         mocks={[stepAndCardBlockCreateMock, blockOrderUpdateMock]}
  //       >
  //         <JourneyProvider value={{ journey: defaultJourney }}>
  //           <EditorProvider>{children}</EditorProvider>
  //         </JourneyProvider>
  //       </MockedProvider>
  //     )
  //   })

  //   await act(
  //     async () =>
  //       await hook.current({
  //         x: -200,
  //         y: 38,
  //         source: 'SocialPreview',
  //         sourceHandle: null
  //       })
  //   )

  //   expect(blockOrderUpdateMock.result).toHaveBeenCalled()
  // })

  // it('should update navigateToBlockAction for action', async () => {
  //   mockUuidv4.mockReturnValueOnce('newStep.id')
  //   mockUuidv4.mockReturnValueOnce('newCard.id')

  //   const { result: hook } = renderHook(() => useCreateStep(), {
  //     wrapper: ({ children }) => (
  //       <MockedProvider
  //         mocks={[
  //           stepAndCardBlockCreateMock,
  //           blockActionNavigateToBlockUpdateMock
  //         ]}
  //       >
  //         <JourneyProvider value={{ journey: defaultJourney }}>
  //           <EditorProvider initialState={{ steps: [mockStepBlock] }}>
  //             {children}
  //           </EditorProvider>
  //         </JourneyProvider>
  //       </MockedProvider>
  //     )
  //   })

  //   await act(
  //     async () =>
  //       await hook.current({
  //         x: -200,
  //         y: 38,
  //         source: 'step1.id',
  //         sourceHandle: 'block1.id'
  //       })
  //   )

  //   expect(blockActionNavigateToBlockUpdateMock.result).toHaveBeenCalled()
  // })
})
