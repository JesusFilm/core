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

      expect(thumbsUpButton).toBeInTheDocument()
      expect(thumbsDownButton).toBeInTheDocument()

      expect(screen.getByLabelText('Good Response')).toBeInTheDocument()
      expect(screen.getByLabelText('Bad Response')).toBeInTheDocument()

      expect(thumbsUpButton).not.toHaveClass('MuiIconButton-colorPrimary')
      expect(thumbsDownButton).not.toHaveClass('MuiIconButton-colorPrimary')

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

      expect(thumbsUpButton).toHaveClass('MuiIconButton-colorPrimary')

      await waitFor(() => {
        expect(mockLangfuseWeb.score).toHaveBeenCalledWith({
          traceId: mockTraceId,
          name: 'user_feedback',
          value: 1
        })
      })

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

      expect(thumbsDownButton).toHaveClass('MuiIconButton-colorPrimary')

      await waitFor(() => {
        expect(mockLangfuseWeb.score).toHaveBeenCalledWith({
          traceId: mockTraceId,
          name: 'user_feedback',
          value: 0
        })
      })

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

      await userEvent.click(thumbsUpButton)
      expect(thumbsUpButton).toHaveClass('MuiIconButton-colorPrimary')
      expect(thumbsDownButton).not.toHaveClass('MuiIconButton-colorPrimary')

      await userEvent.click(thumbsDownButton)
      expect(thumbsDownButton).toHaveClass('MuiIconButton-colorPrimary')
      expect(thumbsUpButton).not.toHaveClass('MuiIconButton-colorPrimary')

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

      expect(thumbsUpButton).toHaveClass('MuiIconButton-colorPrimary')

      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(thumbsUpButton).toHaveClass('MuiIconButton-colorPrimary')
    })
  })
})
