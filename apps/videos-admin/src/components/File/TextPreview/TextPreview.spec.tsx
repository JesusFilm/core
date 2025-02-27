import { render, screen, waitFor } from '@testing-library/react'

import { TextPreview } from './TextPreview'

const file = new File(['text file content'], 'test.txt', { type: 'text/plain' })

describe('TextPreview', () => {
  it('should render', async () => {
    render(<TextPreview file={file} />)

    await waitFor(() => {
      expect(screen.getByText('text file content')).toBeInTheDocument()
    })
  })
})
