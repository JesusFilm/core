import { render, screen, waitFor } from '@testing-library/react'

import { StateLoading } from './Loading'

describe('StateLoading', () => {
  describe('Conditional Rendering', () => {
    it('should render loading spinner when status is submitted', () => {
      render(<StateLoading status="submitted" />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should not render loading spinner when status is streaming', () => {
      render(<StateLoading status="streaming" />)

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    it('should not render loading spinner when status is ready', () => {
      render(<StateLoading status="ready" />)

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    it('should not render loading spinner when status is error', () => {
      render(<StateLoading status="error" />)

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })
  })

  describe('Collapse Animation', () => {
    it('should not render progress bar when status changes from submitted', async () => {
      const { rerender } = render(<StateLoading status="submitted" />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()

      rerender(<StateLoading status="ready" />)

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      })
    })
  })
})
