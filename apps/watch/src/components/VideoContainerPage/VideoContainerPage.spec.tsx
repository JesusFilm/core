import { fireEvent, render, waitFor } from '@testing-library/react'

import { SnackbarProvider } from 'notistack'

import { MockedProvider } from '@apollo/client/testing'
import {
  VideoContentFields,
  VideoContentFields_children
} from '../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../libs/videoContext'
import { GET_VIDEO_CHILDREN } from './VideoContainerPage'
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
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: video }}>
            <VideoContainerPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText(video.title[0].value)).toBeInTheDocument()
  })

  it('should render snippet', async () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: video }}>
            <VideoContainerPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText(video.snippet[0].value)).toBeInTheDocument()
  })

  it('should render share button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: video }}>
            <VideoContainerPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Share' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Share' }))
    expect(
      getByRole('dialog', { name: 'Share this video' })
    ).toBeInTheDocument()
  })

  it('should get videos', async () => {
    const result = jest.fn(() => ({
      data: {
        video: {
          children: [{ ...video }]
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VIDEO_CHILDREN,
              variables: {
                id: video.id
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <VideoProvider value={{ content: video }}>
            <VideoContainerPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
