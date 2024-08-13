import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import {
  BlockRestore,
  BlockRestoreVariables
} from '../../../../../../../__generated__/BlockRestore'
import { restoreStepMock } from '../../../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { stepAndCardBlockCreateMock } from '../../../../../../libs/useStepAndCardBlockCreateMutation/useStepAndCardBlockCreateMutation.mock'
import { TestUseCreateStepHooks } from '../TestUseCreateStepHooks'

import { mockBlockDelete, mockNewStepBlock } from './useCreateStep.mock'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('useCreateStep', () => {
  it('should create a step on click', async () => {
    mockUuidv4.mockReturnValueOnce('newStep.id')
    mockUuidv4.mockReturnValueOnce('newCard.id')

    const result = jest.fn().mockReturnValue(stepAndCardBlockCreateMock.result)

    render(
      <MockedProvider mocks={[{ ...stepAndCardBlockCreateMock, result }]}>
        <TestUseCreateStepHooks />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('useCreateStep'))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should undo a step', async () => {
    mockUuidv4.mockReturnValueOnce('newStep.id')
    mockUuidv4.mockReturnValueOnce('newCard.id')

    const result = jest.fn().mockReturnValue(stepAndCardBlockCreateMock.result)
    const result2 = jest.fn().mockReturnValue(mockBlockDelete.result)

    render(
      <MockedProvider
        mocks={[
          { ...stepAndCardBlockCreateMock, result },
          { ...mockBlockDelete, result: result2 }
        ]}
      >
        <TestUseCreateStepHooks selectedStep={mockNewStepBlock} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('useCreateStep'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should redo a step', async () => {
    mockUuidv4.mockReturnValueOnce('newStep.id')
    mockUuidv4.mockReturnValueOnce('newCard.id')

    const mockRestoreStep: MockedResponse<BlockRestore, BlockRestoreVariables> =
      {
        request: {
          ...restoreStepMock.request,
          variables: { id: 'newStep.id' }
        },
        result: {
          ...restoreStepMock.result
        }
      }

    const result = jest.fn().mockReturnValue(stepAndCardBlockCreateMock.result)
    const result2 = jest.fn().mockReturnValue(mockBlockDelete.result)
    const result3 = jest.fn().mockResolvedValue(mockRestoreStep.request)

    render(
      <MockedProvider
        mocks={[
          { ...stepAndCardBlockCreateMock, result },
          { ...mockBlockDelete, result: result2 },
          { ...mockRestoreStep, result: result3 }
        ]}
      >
        <TestUseCreateStepHooks selectedStep={mockNewStepBlock} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('useCreateStep'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(result3).toHaveBeenCalled())
  })
})
