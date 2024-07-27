import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { UnsplashSearch } from '.'

describe('UnsplashSearch', () => {
  it('should call handle submit with field value', async () => {
    const handleSubmit = jest.fn()
    render(<UnsplashSearch handleSubmit={handleSubmit} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'UnsplashSearch' }), {
      target: { value: 'Jesus' }
    })
    await waitFor(() => expect(handleSubmit).toHaveBeenCalledWith('Jesus'))
  })
})
