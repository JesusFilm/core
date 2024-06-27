import { fireEvent, render, waitFor } from '@testing-library/react'

import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'

import { VideoHeading } from '.'

describe('VideoHeading', () => {
  it('should display link and button to feature film page', () => {
    const { getByRole } = render(
      <VideoProvider
        value={{
          content: videos.find(
            ({ id }) => id === '1_jf6101-0-0'
          ) as VideoContentFields,
          container: videos.find(({ id }) => id === '1_jf-0-0')
        }}
      >
        <VideoHeading onShareClick={jest.fn()} onDownloadClick={jest.fn()} />
      </VideoProvider>
    )
    expect(getByRole('link', { name: 'JESUS' })).toHaveAttribute(
      'href',
      '/watch/jesus/english'
    )
    expect(getByRole('link', { name: 'Watch Full Film' })).toHaveAttribute(
      'href',
      '/watch/jesus/english'
    )
  })

  it('should display link and button to container page', async () => {
    const { getByRole } = render(
      <VideoProvider
        value={{
          content: videos.find(
            ({ id }) => id === '1_jf6119-0-0'
          ) as VideoContentFields,
          container: videos.find(({ id }) => id === 'LUMOCollection')
        }}
      >
        <VideoHeading onShareClick={jest.fn()} onDownloadClick={jest.fn()} />
      </VideoProvider>
    )
    await waitFor(() =>
      expect(getByRole('link', { name: 'LUMO' })).toHaveAttribute(
        'href',
        '/watch/lumo/english'
      )
    )

    expect(getByRole('link', { name: 'See All' })).toHaveAttribute(
      'href',
      '/watch/lumo/english'
    )
  })

  it('should have share button and download button', () => {
    const handleShareClick = jest.fn()
    const handleDownloadClick = jest.fn()
    const { getByTestId } = render(
      <VideoProvider
        value={{
          content: videos.find(
            ({ id }) => id === '1_jf6101-0-0'
          ) as VideoContentFields,
          container: videos.find(({ id }) => id === '1_jf-0-0')
        }}
      >
        <VideoHeading
          onShareClick={handleShareClick}
          onDownloadClick={handleDownloadClick}
          hasPlayed
        />
      </VideoProvider>
    )
    fireEvent.click(getByTestId('ShareOutlinedIcon'))
    expect(handleShareClick).toHaveBeenCalled()
    fireEvent.click(getByTestId('FileDownloadOutlinedIcon'))
    expect(handleDownloadClick).toHaveBeenCalled()
  })
})
