import { render } from '@testing-library/react'

import { SnackbarProvider } from 'notistack'
import {
  VideoContentFields,
  VideoContentFields_children
} from '../../../__generated__/VideoContentFields'
import { VideoContainer } from '.'

const video = {
  id: '2_video-0-0',
  image:
    'https://images.unsplash.com/photo-1670140274562-2496ccaa5271?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80',
  title: [{ value: 'video title' }],
  description: [
    {
      value: 'video description'
    }
  ],
  variant: {
    duration: 3505,
    slug: 'content/slug',
    variant: {
      slug: 'variant-slug/english'
    }
  },
  children: []
} as unknown as VideoContentFields

describe('VideoContainer', () => {
  it('should render description', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <VideoContainer content={video} />
      </SnackbarProvider>
    )
    expect(getByText('video description')).toBeInTheDocument()
  })

  it('should render SimpleHero', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <VideoContainer content={video} />
      </SnackbarProvider>
    )
    expect(getByText('video title')).toBeInTheDocument()
  })

  it('should render VideoHero', () => {
    const withHls = {
      ...video,
      variant: {
        hls: ''
      }
    } as unknown as VideoContentFields

    const { getAllByRole } = render(
      <SnackbarProvider>
        <VideoContainer content={withHls} />
      </SnackbarProvider>
    )

    expect(getAllByRole('button', { name: 'Play Video' })).toHaveLength(2)
  })

  it('should render Video Carousel for content', () => {
    const withChildren = {
      ...video,
      children: [{ id: 'child.id' } as unknown as VideoContentFields_children]
    }
    const { getByTestId } = render(
      <SnackbarProvider>
        <VideoContainer content={withChildren} />
      </SnackbarProvider>
    )

    expect(getByTestId('videos-carousel')).toBeInTheDocument()
  })

  it('should render Video Carousel for container', () => {
    const container = {
      ...video,
      children: [{ id: 'child.id' } as unknown as VideoContentFields_children]
    }
    const { getByTestId } = render(
      <SnackbarProvider>
        <VideoContainer content={video} container={container} />
      </SnackbarProvider>
    )

    expect(getByTestId('videos-carousel')).toBeInTheDocument()
  })

  it('should render open share dialog', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <VideoContainer content={video} />
      </SnackbarProvider>
    )
    expect(getByRole('button', { name: 'Share' })).toBeInTheDocument()
  })
})
