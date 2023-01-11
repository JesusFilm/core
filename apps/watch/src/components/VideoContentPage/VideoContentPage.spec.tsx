import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { MockedProvider } from '@apollo/client/testing'
import { videos } from '../Videos/testData'
import { VideoProvider } from '../../libs/videoContext'
import { GET_VIDEO_CHILDREN } from './VideoContentPage'
import { VideoContentPage } from '.'

describe('VideoContentPage', () => {
  it('should render VideoHero', () => {
    const { getAllByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContentPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getAllByRole('button', { name: 'Play' })).toHaveLength(1)
  })

  it('should render description', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContentPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Description' })).toBeInTheDocument()
  })

  it('should render related videos', () => {
    const result = jest.fn(() => ({
      data: {
        video: {
          children: [
            {
              id: 'child.id',
              label: 'label',
              title: [],
              image: null,
              imageAlt: [],
              snippet: [],
              slug: 'slug',
              children: [],
              variant: null
            }
          ]
        }
      }
    }))

    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VIDEO_CHILDREN,
              variables: {
                input: {
                  id: '1_jf-0-0'
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[2], container: videos[0] }}>
            <VideoContentPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByTestId('videos-carousel')).toBeInTheDocument()
  })

  it('should render title on feature films', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContentPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('heading', { name: 'JESUS Scenes' })).toBeInTheDocument()
  })

  it('should render share button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContentPage />
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

  it('should render download button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContentPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Download' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Download' }))
    expect(getByRole('dialog', { name: 'Download Video' })).toBeInTheDocument()
  })
})
