import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_StepBlock as StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'

import { TestUseCreateStepHooks } from '../TestUseCreateStepHooks'

import {
  mockStepBlock,
  mockStepBlockCreateFromStep,
  mockStepBlockDeleteFromStep,
  mockStepBlockRestoreFromStep
} from './useCreateStepFromStep.mock'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

const step = {
  __typename: 'StepBlock',
  id: 'step.id'
} as unknown as TreeBlock<StepBlock>

describe('useCreateStepFromStep', () => {
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

    const result = jest.fn().mockReturnValue(mockStepBlockCreateFromStep.result)

    render(
      <MockedProvider
        mocks={[{ ...mockStepBlockCreateFromStep, result }]}
        cache={cache}
      >
        <TestUseCreateStepHooks
          sourceStep={mockStepBlock}
          selectedStep={mockStepBlock}
        />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('useCreateStepFromStep'))
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
      y: 777,
      slug: null
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
      fullscreen: false,
      backdropBlur: null
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

    const result = jest.fn().mockReturnValue(mockStepBlockCreateFromStep.result)
    const result2 = jest
      .fn()
      .mockReturnValue(mockStepBlockDeleteFromStep.result)

    render(
      <MockedProvider
        mocks={[
          { ...mockStepBlockCreateFromStep, result },
          { ...mockStepBlockDeleteFromStep, result: result2 }
        ]}
        cache={cache}
      >
        <TestUseCreateStepHooks
          sourceStep={mockStepBlock}
          selectedStep={step}
        />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('useCreateStepFromStep'))
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
      y: 777,
      slug: null
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
      fullscreen: false,
      backdropBlur: null
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

    const result = jest.fn().mockReturnValue(mockStepBlockCreateFromStep.result)
    const result2 = jest
      .fn()
      .mockReturnValue(mockStepBlockDeleteFromStep.result)
    const result3 = jest
      .fn()
      .mockReturnValue(mockStepBlockRestoreFromStep.result)

    render(
      <MockedProvider
        mocks={[
          { ...mockStepBlockCreateFromStep, result },
          { ...mockStepBlockDeleteFromStep, result: result2 },
          { ...mockStepBlockRestoreFromStep, result: result3 }
        ]}
        cache={cache}
      >
        <TestUseCreateStepHooks
          sourceStep={mockStepBlock}
          selectedStep={step}
        />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('useCreateStepFromStep'))
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
      y: 777,
      slug: null
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
      fullscreen: false,
      backdropBlur: null
    })

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(result3).toHaveBeenCalled())
  })
})
