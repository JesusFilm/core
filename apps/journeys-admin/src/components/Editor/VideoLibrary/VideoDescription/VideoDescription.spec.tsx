import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { VideoDescription } from './VideoDescription'

describe('VideoDescription', () => {
  it('should elongate the text when the More button is clicked', async () => {
    const videoDescription =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.'

    const { getByRole } = render(
      <VideoDescription videoDescription={videoDescription} />
    )

    await waitFor(() => {
      fireEvent.click(getByRole('button', { name: 'More' }))
    })
    expect(getByRole('button', { name: 'Less' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Less' }))
    expect(getByRole('button', { name: 'More' })).toBeInTheDocument()
  })

  it('should not render More button on short text', async () => {
    const videoDescription =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    const { queryByRole } = render(
      <VideoDescription videoDescription={videoDescription} />
    )

    await waitFor(() => {
      expect(queryByRole('button', { name: 'More' })).not.toBeInTheDocument()
    })
  })
})
