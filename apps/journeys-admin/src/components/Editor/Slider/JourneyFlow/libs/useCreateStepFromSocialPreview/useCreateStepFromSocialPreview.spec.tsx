import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { TestUseCreateStepHooks } from '../TestUseCreateStepHooks'
import {
  deleteStepMock,
  mockBlockDeleteWithBlockOrderUpdate,
  mockBlockRestoreWithBlockOrderUpdate,
  mockNewCardBlock,
  mockNewStepBlock,
  mockStepAndCardBlockCreateWithBlockOrderUpdate
} from './useCreateStepFromSocialPreview.mock'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('useCreateStepFromSocialPreview', () => {
  it('should create a new step', async () => {
    mockUuidv4.mockReturnValueOnce(mockNewStepBlock.id)
    mockUuidv4.mockReturnValueOnce(mockNewCardBlock.id)

    const result = jest
      .fn()
      .mockResolvedValue(mockStepAndCardBlockCreateWithBlockOrderUpdate.result)

    render(
      <MockedProvider
        mocks={[{ ...mockStepAndCardBlockCreateWithBlockOrderUpdate, result }]}
      >
        <TestUseCreateStepHooks />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('useCreateStepFromSocialPreview'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should undo a new step', async () => {
    mockUuidv4.mockReturnValueOnce(mockNewStepBlock.id)
    mockUuidv4.mockReturnValueOnce(mockNewCardBlock.id)

    const result = jest
      .fn()
      .mockResolvedValue(mockStepAndCardBlockCreateWithBlockOrderUpdate.result)

    const result2 = jest
      .fn()
      .mockResolvedValue(mockBlockDeleteWithBlockOrderUpdate.result)

    render(
      <MockedProvider
        mocks={[
          { ...mockStepAndCardBlockCreateWithBlockOrderUpdate, result },
          { ...mockBlockDeleteWithBlockOrderUpdate, result: result2 }
        ]}
      >
        <TestUseCreateStepHooks
          steps={[mockNewStepBlock]}
          selectedStep={mockNewStepBlock}
        />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('useCreateStepFromSocialPreview'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should undo a new step even if it is the only step', async () => {
    mockUuidv4.mockReturnValueOnce(mockNewStepBlock.id)
    mockUuidv4.mockReturnValueOnce(mockNewCardBlock.id)

    const result = jest
      .fn()
      .mockResolvedValue(mockStepAndCardBlockCreateWithBlockOrderUpdate.result)

    const result2 = jest.fn().mockResolvedValue(deleteStepMock.result)

    render(
      <MockedProvider
        mocks={[
          { ...mockStepAndCardBlockCreateWithBlockOrderUpdate, result },
          { ...deleteStepMock, result: result2 }
        ]}
      >
        <TestUseCreateStepHooks />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('useCreateStepFromSocialPreview'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should redo a step', async () => {
    mockUuidv4.mockReturnValueOnce(mockNewStepBlock.id)
    mockUuidv4.mockReturnValueOnce(mockNewCardBlock.id)

    const result = jest
      .fn()
      .mockResolvedValue(mockStepAndCardBlockCreateWithBlockOrderUpdate.result)

    const result2 = jest.fn().mockResolvedValue(deleteStepMock.result)
    const result3 = jest
      .fn()
      .mockResolvedValue(mockBlockRestoreWithBlockOrderUpdate.result)

    render(
      <MockedProvider
        mocks={[
          { ...mockStepAndCardBlockCreateWithBlockOrderUpdate, result },
          { ...deleteStepMock, result: result2 },
          { ...mockBlockRestoreWithBlockOrderUpdate, result: result3 }
        ]}
      >
        <TestUseCreateStepHooks />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('useCreateStepFromSocialPreview'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(result3).toHaveBeenCalled())
  })
})
