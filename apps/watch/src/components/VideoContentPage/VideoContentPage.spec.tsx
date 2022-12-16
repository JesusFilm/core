import { fireEvent, render } from '@testing-library/react'

import { SnackbarProvider } from 'notistack'
import {
  VideoContentFields,
  VideoContentFields_children
} from '../../../__generated__/VideoContentFields'
import { VideoVariantDownloadQuality } from '../../../__generated__/globalTypes'
import { VideoProvider } from '../../libs/videoContext'
import { VideoContentPage } from '.'

const video = {
  id: '2_video-0-0',
  image:
    'https://images.unsplash.com/photo-1670140274562-2496ccaa5271?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80',
  imageAlt: [{ value: 'image alt' }],
  snippet: [{ value: 'video snippet' }],
  title: [{ value: 'video title' }],
  description: [
    {
      value: 'video description'
    }
  ],
  variant: {
    hls: '',
    duration: 100,
    downloads: [
      {
        __typename: 'VideoVariantDownload',
        quality: VideoVariantDownloadQuality.low,
        size: 207296233,
        url: 'https://arc.gt/y1s23'
      },
      {
        __typename: 'VideoVariantDownload',
        quality: VideoVariantDownloadQuality.high,
        size: 2361587773,
        url: 'https://arc.gt/7geui'
      }
    ],
    slug: '2_video-0-0/english'
  },
  children: [{ id: 'child.id' } as unknown as VideoContentFields_children]
} as unknown as VideoContentFields

describe('VideoContentPage', () => {
  it('should render VideoHero', () => {
    const { getAllByRole } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: video }}>
          <VideoContentPage />
        </VideoProvider>
      </SnackbarProvider>
    )

    expect(getAllByRole('button', { name: 'Play Video' })).toHaveLength(1)
  })

  it('should render description', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: video }}>
          <VideoContentPage />
        </VideoProvider>
      </SnackbarProvider>
    )
    expect(getByText('video description')).toBeInTheDocument()
  })

  it('should render related videos', () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: video }}>
          <VideoContentPage />
        </VideoProvider>
      </SnackbarProvider>
    )

    expect(getByTestId('videos-carousel')).toBeInTheDocument()
  })

  it('should render share button', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: video }}>
          <VideoContentPage />
        </VideoProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button', { name: 'Share' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Share' }))
    expect(
      getByRole('dialog', { name: 'Share this video' })
    ).toBeInTheDocument()
  })
})
