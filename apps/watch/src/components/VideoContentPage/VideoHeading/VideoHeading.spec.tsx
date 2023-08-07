import { fireEvent, render } from '@testing-library/react'

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
      `/jesus/english`
    )
    expect(getByRole('link', { name: 'Watch Full Film' })).toHaveAttribute(
      'href',
      `/jesus/english`
    )
  })

  it('should display link and button to container page', () => {
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
    expect(getByRole('link', { name: 'LUMO' })).toHaveAttribute(
      'href',
      `/lumo/english`
    )
    expect(getByRole('link', { name: 'See All' })).toHaveAttribute(
      'href',
      `/lumo/english`
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
