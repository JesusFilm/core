import { fireEvent, render } from '@testing-library/react'

import { SnackbarProvider } from 'notistack'

import {
  VideoContentFields,
  VideoContentFields_children
} from '../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../libs/videoContext'
import { VideoContainerPage } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => {
    return {
      query: {}
    }
  }
}))

const video = {
  id: '2_video-0-0',
  image:
    'https://images.unsplash.com/photo-1670140274562-2496ccaa5271?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80',
  title: [{ value: 'video title' }],
  snippet: [
    {
      value: 'video description'
    }
  ],
  children: [
    {
      id: 'child.id',
      slug: 'slug',
      image: 'image url',
      imageAlt: [{ value: 'image alt' }],
      variant: {
        duration: 1
      },
      title: [{ value: 'child title' }],
      children: []
    } as unknown as VideoContentFields_children
  ],
  slug: 'video-slug'
} as unknown as VideoContentFields

describe('VideoContainerPage', () => {
  it('should render ContainerHero', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: video }}>
          <VideoContainerPage />
        </VideoProvider>
      </SnackbarProvider>
    )
    expect(getByText(video.title[0].value)).toBeInTheDocument()
  })

  it('should render snippet', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: video }}>
          <VideoContainerPage />
        </VideoProvider>
      </SnackbarProvider>
    )
    expect(getByText(video.snippet[0].value)).toBeInTheDocument()
  })

  it('should render share button', () => {
    const { getByRole, getByLabelText } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: video }}>
          <VideoContainerPage />
        </VideoProvider>
      </SnackbarProvider>
    )
    expect(getByLabelText('share-button')).toBeInTheDocument()
    fireEvent.click(getByLabelText('share-button'))
    expect(
      getByRole('dialog', { name: 'Share this video' })
    ).toBeInTheDocument()
  })

  xit('should render videos', () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: video }}>
          <VideoContainerPage />
        </VideoProvider>
      </SnackbarProvider>
    )
    expect(getByTestId('videos-grid')).toBeInTheDocument()
  })
})
