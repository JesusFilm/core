import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { VideoDescription } from './VideoDescription'

describe('VideoDescription', () => {
  it('should elongate and truncate the text when the More and Less button is clicked', async () => {
    const videoDescription =
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec.'

    const { getByRole } = render(
      <VideoDescription videoDescription={videoDescription} />
    )

    fireEvent.click(getByRole('button', { name: 'More' }))
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

    expect(queryByRole('button', { name: 'More' })).not.toBeInTheDocument()
  })
})
