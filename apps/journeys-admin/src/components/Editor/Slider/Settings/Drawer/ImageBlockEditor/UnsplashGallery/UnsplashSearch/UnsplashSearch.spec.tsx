import { fireEvent, render, waitFor } from '@testing-library/react'

import { UnsplashSearch } from './UnsplashSearch'

describe('UnsplashSearch', () => {
  it('should return a list of unsplash images', async () => {
    const handleSubmit = jest.fn()
    const { getByRole } = render(<UnsplashSearch handleSubmit={handleSubmit} />)
    const textbox = getByRole('textbox', { name: 'UnsplashSearch' })
    fireEvent.submit(textbox, {
      target: { value: 'Jesus' }
    })
    await waitFor(() => expect(handleSubmit).toHaveBeenCalled())
  })
})
