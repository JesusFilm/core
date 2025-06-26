import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { langfuseWeb } from '../../../../libs/ai/langfuse/client'

import { UserFeedback } from './UserFeedback'

jest.mock('../../../../libs/ai/langfuse/client', () => ({
  langfuseWeb: {
    score: jest.fn().mockResolvedValue({})
  }
}))

const mockLangfuseWeb = langfuseWeb as jest.Mocked<{
  score: jest.MockedFunction<any>
}>

describe('UserFeedback', () => {
  const mockTraceId = 'test-trace-id-123'

  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render thumbs up/down buttons with correct styling, tooltips, and default state', () => {
      render(<UserFeedback traceId={mockTraceId} />)

      const thumbsUpButton = screen.getByRole('button', {
        name: /good response/i
      })
      const thumbsDownButton = screen.getByRole('button', {
        name: /bad response/i
      })

      // Buttons should be present
      expect(thumbsUpButton).toBeInTheDocument()
      expect(thumbsDownButton).toBeInTheDocument()

      // Tooltips should be correct (via aria-label)
      expect(screen.getByLabelText('Good Response')).toBeInTheDocument()
      expect(screen.getByLabelText('Bad Response')).toBeInTheDocument()

      // Buttons should have default color initially (not primary)
      expect(thumbsUpButton).not.toHaveClass('MuiIconButton-colorPrimary')
      expect(thumbsDownButton).not.toHaveClass('MuiIconButton-colorPrimary')

      // Buttons should have small size
      expect(thumbsUpButton).toHaveClass('MuiIconButton-sizeSmall')
      expect(thumbsDownButton).toHaveClass('MuiIconButton-sizeSmall')
    })
  })

  describe('Positive Feedback Interaction', () => {
    it('should handle thumbs up click, update visual state, and call langfuse correctly', async () => {
      render(<UserFeedback traceId={mockTraceId} />)

      const thumbsUpButton = screen.getByRole('button', {
        name: /good response/i
      })

      await userEvent.click(thumbsUpButton)

      // Button should be highlighted after click
      expect(thumbsUpButton).toHaveClass('MuiIconButton-colorPrimary')

      // Should call langfuse with correct parameters
      await waitFor(() => {
        expect(mockLangfuseWeb.score).toHaveBeenCalledWith({
          traceId: mockTraceId,
          name: 'user_feedback',
          value: 1
        })
      })

      // Should call langfuse only once
      expect(mockLangfuseWeb.score).toHaveBeenCalledTimes(1)
    })
  })

  describe('Negative Feedback Interaction', () => {
    it('should handle thumbs down click, update visual state, and call langfuse correctly', async () => {
      render(<UserFeedback traceId={mockTraceId} />)

      const thumbsDownButton = screen.getByRole('button', {
        name: /bad response/i
      })

      await userEvent.click(thumbsDownButton)

      // Button should be highlighted after click
      expect(thumbsDownButton).toHaveClass('MuiIconButton-colorPrimary')

      // Should call langfuse with correct parameters
      await waitFor(() => {
        expect(mockLangfuseWeb.score).toHaveBeenCalledWith({
          traceId: mockTraceId,
          name: 'user_feedback',
          value: 0
        })
      })

      // Should call langfuse only once
      expect(mockLangfuseWeb.score).toHaveBeenCalledTimes(1)
    })
  })

  describe('State Management', () => {
    it('should allow switching between positive and negative feedback', async () => {
      render(<UserFeedback traceId={mockTraceId} />)

      const thumbsUpButton = screen.getByRole('button', {
        name: /good response/i
      })
      const thumbsDownButton = screen.getByRole('button', {
        name: /bad response/i
      })

      // Click thumbs up first
      await userEvent.click(thumbsUpButton)
      expect(thumbsUpButton).toHaveClass('MuiIconButton-colorPrimary')
      expect(thumbsDownButton).not.toHaveClass('MuiIconButton-colorPrimary')

      // Then click thumbs down
      await userEvent.click(thumbsDownButton)
      expect(thumbsDownButton).toHaveClass('MuiIconButton-colorPrimary')
      expect(thumbsUpButton).not.toHaveClass('MuiIconButton-colorPrimary')

      // Verify both calls were made
      await waitFor(() => {
        expect(mockLangfuseWeb.score).toHaveBeenCalledTimes(2)
      })
    })

    it('should persist feedback state after selection', async () => {
      render(<UserFeedback traceId={mockTraceId} />)

      const thumbsUpButton = screen.getByRole('button', {
        name: /good response/i
      })

      await userEvent.click(thumbsUpButton)

      // Button should remain highlighted
      expect(thumbsUpButton).toHaveClass('MuiIconButton-colorPrimary')

      // State should persist without additional clicks
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(thumbsUpButton).toHaveClass('MuiIconButton-colorPrimary')
    })
  })

  describe('Error Handling', () => {
    it('should throw console error on langfuse score failure', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(jest.fn())

      render(<UserFeedback traceId={mockTraceId} />)

      const thumbsUpButton = screen.getByRole('button', {
        name: /good response/i
      })

      // Mock langfuse to reject
      mockLangfuseWeb.score.mockRejectedValueOnce(new Error('Network error'))

      // Component should not crash when langfuse fails
      await userEvent.click(thumbsUpButton)

      // Button should still update visually even if langfuse fails
      expect(thumbsUpButton).toHaveClass('MuiIconButton-colorPrimary')

      // Should log the error
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to record user feedback analytics: ',
          expect.objectContaining({ message: 'Network error' })
        )
      })
    })

    it('should remain interactive after langfuse failure', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(jest.fn())

      render(<UserFeedback traceId={mockTraceId} />)

      const thumbsUpButton = screen.getByRole('button', {
        name: /good response/i
      })
      const thumbsDownButton = screen.getByRole('button', {
        name: /bad response/i
      })

      // Mock langfuse to reject on first call, succeed on second
      mockLangfuseWeb.score
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({})

      // First click fails but UI updates
      await userEvent.click(thumbsUpButton)
      expect(thumbsUpButton).toHaveClass('MuiIconButton-colorPrimary')

      // Second click should still work normally
      await userEvent.click(thumbsDownButton)
      expect(thumbsDownButton).toHaveClass('MuiIconButton-colorPrimary')
      expect(thumbsUpButton).not.toHaveClass('MuiIconButton-colorPrimary')

      // Both langfuse calls should have been attempted
      expect(mockLangfuseWeb.score).toHaveBeenCalledTimes(2)

      // Error should have been logged for the first call
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to record user feedback analytics: ',
          expect.objectContaining({ message: 'Network error' })
        )
      })
    })
  })
})
