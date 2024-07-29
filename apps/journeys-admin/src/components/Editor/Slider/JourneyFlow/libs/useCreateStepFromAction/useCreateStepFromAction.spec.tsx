import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { TestUseCreateStepHooks } from '../TestUseCreateStepHooks'
import {
  mockBlockDeleteWithBlockActionUpdate,
  mockBlockRestoreWithBlockActionUpdate,
  mockNewCardBlock,
  mockNewStepBlock,
  mockOriginButtonBlock,
  mockStepAndCardBlockCreateWithBlockActionUpdate,
  mockStepBlock
} from './useCreateStepFromAction.mock'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('useCreateStepFromAction', () => {
  it('should create step block', async () => {
    mockUuidv4.mockReturnValueOnce(mockNewStepBlock.id)
    mockUuidv4.mockReturnValueOnce(mockNewCardBlock.id)

    const result = jest
      .fn()
      .mockResolvedValue(mockStepAndCardBlockCreateWithBlockActionUpdate.result)

    render(
      <MockedProvider
        mocks={[{ ...mockStepAndCardBlockCreateWithBlockActionUpdate, result }]}
      >
        <TestUseCreateStepHooks
          sourceStep={mockStepBlock}
          sourceBlock={mockOriginButtonBlock}
        />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('useCreateStepFromAction'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should undo a step block', async () => {
    mockUuidv4.mockReturnValueOnce(mockNewStepBlock.id)
    mockUuidv4.mockReturnValueOnce(mockNewCardBlock.id)

    const result = jest
      .fn()
      .mockResolvedValue(mockStepAndCardBlockCreateWithBlockActionUpdate.result)

    const result2 = jest
      .fn()
      .mockResolvedValue(mockBlockDeleteWithBlockActionUpdate.result)

    render(
      <MockedProvider
        mocks={[
          { ...mockStepAndCardBlockCreateWithBlockActionUpdate, result },
          { ...mockBlockDeleteWithBlockActionUpdate, result: result2 }
        ]}
      >
        <TestUseCreateStepHooks
          sourceStep={mockStepBlock}
          sourceBlock={mockOriginButtonBlock}
          selectedStep={mockStepBlock}
        />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('useCreateStepFromAction'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should redo a step block', async () => {
    mockUuidv4.mockReturnValueOnce(mockNewStepBlock.id)
    mockUuidv4.mockReturnValueOnce(mockNewCardBlock.id)

    const result = jest
      .fn()
      .mockResolvedValue(mockStepAndCardBlockCreateWithBlockActionUpdate.result)

    const result2 = jest
      .fn()
      .mockResolvedValue(mockBlockDeleteWithBlockActionUpdate.result)

    const result3 = jest
      .fn()
      .mockResolvedValue(mockBlockRestoreWithBlockActionUpdate.result)

    render(
      <MockedProvider
        mocks={[
          { ...mockStepAndCardBlockCreateWithBlockActionUpdate, result },
          { ...mockBlockDeleteWithBlockActionUpdate, result: result2 },
          { ...mockBlockRestoreWithBlockActionUpdate, result: result3 }
        ]}
      >
        <TestUseCreateStepHooks
          sourceStep={mockStepBlock}
          sourceBlock={mockOriginButtonBlock}
          selectedStep={mockStepBlock}
        />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('useCreateStepFromAction'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(result3).toHaveBeenCalled())
  })
})
