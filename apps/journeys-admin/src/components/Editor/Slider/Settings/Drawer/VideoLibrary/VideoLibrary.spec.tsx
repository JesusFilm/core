import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import {
  VideoBlockSource,
  VideoLabel
} from '../../../../../../../__generated__/globalTypes'

import { GET_VIDEOS } from './VideoFromLocal/VideoFromLocal'

import { VideoLibrary } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('VideoLibrary', () => {
  const push = jest.fn()
  const on = jest.fn()

  describe('smUp', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('should render the Video Library on the right', () => {
      render(
        <MockedProvider>
          <VideoLibrary open />
        </MockedProvider>
      )
      expect(screen.getByText('Video Library')).toBeInTheDocument()
      expect(
        screen.getByTestId('VideoLibrary').parentElement?.parentElement
      ).toHaveClass('MuiDrawer-paperAnchorRight')
    })

    it('should close VideoLibrary on close Icon click', () => {
      const onClose = jest.fn()
      render(
        <MockedProvider>
          <VideoLibrary open onClose={onClose} />
        </MockedProvider>
      )
      expect(screen.getAllByRole('button')[0]).toContainElement(
        screen.getByTestId('X2Icon')
      )
      fireEvent.click(screen.getAllByRole('button')[0])
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('xsDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should render the VideoLibrary from the bottom', () => {
      render(
        <MockedProvider>
          <VideoLibrary open />
        </MockedProvider>
      )
      expect(screen.getByText('Video Library')).toBeInTheDocument()
      expect(
        screen.getByTestId('VideoLibrary').parentElement?.parentElement
      ).toHaveClass('MuiDrawer-paperAnchorBottom')
    })
  })

  describe('VideoSearch', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('displays searched video', async () => {
      render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  offset: 0,
                  limit: 5,
                  where: {
                    availableVariantLanguageIds: ['529'],
                    title: 'Andreas',
                    labels: [
                      VideoLabel.episode,
                      VideoLabel.featureFilm,
                      VideoLabel.segment,
                      VideoLabel.shortFilm
                    ]
                  }
                }
              },
              result: {
                data: {
                  videos: [
                    {
                      id: '2_0-AndreasStory',
                      image:
                        'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg',
                      snippet: [
                        {
                          primary: true,
                          value:
                            'After living a life full of fighter planes and porsches, Andreas realizes something is missing.'
                        }
                      ],
                      title: [
                        {
                          primary: true,
                          value: "Andreas' Story"
                        }
                      ],
                      variant: {
                        id: 'variantA',
                        duration: 186
                      }
                    }
                  ]
                }
              }
            }
          ]}
        >
          <VideoLibrary open />
        </MockedProvider>
      )
      const textBox = screen.getByRole('textbox')
      fireEvent.change(textBox, {
        target: { value: 'Andreas' }
      })
      await waitFor(() =>
        expect(screen.getByText("Andreas' Story")).toBeInTheDocument()
      )
    })
  })

  it('should render the Video Library on the right', () => {
    render(
      <MockedProvider>
        <VideoLibrary open />
      </MockedProvider>
    )
    expect(screen.getByText('Video Library')).toBeInTheDocument()
    expect(
      screen.getByTestId('VideoLibrary').parentElement?.parentElement
    ).toHaveClass('MuiDrawer-paperAnchorRight')
  })

  it('when video selected calls onSelect', async () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VIDEOS,
              variables: {
                offset: 0,
                limit: 5,
                where: {
                  availableVariantLanguageIds: ['529'],
                  title: null,
                  labels: [
                    VideoLabel.episode,
                    VideoLabel.featureFilm,
                    VideoLabel.segment,
                    VideoLabel.shortFilm
                  ]
                }
              }
            },
            result: {
              data: {
                videos: [
                  {
                    id: '2_0-AndreasStory',
                    image:
                      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg',
                    snippet: [
                      {
                        primary: true,
                        value:
                          'After living a life full of fighter planes and porsches, Andreas realizes something is missing.'
                      }
                    ],
                    title: [
                      {
                        primary: true,
                        value: "Andreas' Story"
                      }
                    ],
                    variant: {
                      id: 'variantA',
                      duration: 186
                    }
                  }
                ]
              }
            }
          }
        ]}
      >
        <VideoLibrary open onSelect={onSelect} onClose={onClose} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByText("Andreas' Story")).toBeInTheDocument()
    )
    await waitFor(() =>
      fireEvent.click(
        screen.getByRole('button', {
          name: "Andreas' Story After living a life full of fighter planes and porsches, Andreas realizes something is missing. 03:06"
        })
      )
    )
    fireEvent.click(screen.getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalledWith({
      duration: 0,
      endAt: 0,
      startAt: 0,
      source: VideoBlockSource.internal,
      videoId: '2_0-AndreasStory',
      videoVariantLanguageId: '529'
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('should render video details if videoId is not null', async () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()

    render(
      <MockedProvider>
        <VideoLibrary
          open
          selectedBlock={{
            id: 'video1.id',
            __typename: 'VideoBlock',
            parentBlockId: 'card1.id',
            description:
              'This is episode 1 of an ongoing series that explores the origins, content, and purpose of the Bible.',
            duration: 348,
            endAt: 348,
            fullsize: true,
            image: 'https://i.ytimg.com/vi/ak06MSETeo4/default.jpg',
            muted: false,
            autoplay: true,
            startAt: 0,
            title: 'What is the Bible?',
            videoId: 'ak06MSETeo4',
            videoVariantLanguageId: null,
            parentOrder: 0,
            action: null,
            source: VideoBlockSource.youTube,
            video: null,
            objectFit: null,
            posterBlockId: 'poster1.id',
            children: []
          }}
          onSelect={onSelect}
          onClose={onClose}
        />
      </MockedProvider>
    )

    await waitFor(() => expect(screen.getByText('Video Details')).toBeVisible())
  })

  it('should render YouTube', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    render(
      <MockedProvider>
        <VideoLibrary open />
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('tab', { name: 'YouTube' }))
    await waitFor(() =>
      expect(screen.getByText('Paste any YouTube Link')).toBeInTheDocument()
    )
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'video-youtube' }
        },
        undefined,
        { shallow: true }
      )
    })
  })

  it('should update url params on library tab click', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    const { getByRole } = render(
      <MockedProvider>
        <VideoLibrary open />
      </MockedProvider>
    )
    fireEvent.click(getByRole('tab', { name: 'Upload' }))
    fireEvent.click(getByRole('tab', { name: 'Library' }))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'video-library' }
        },
        undefined,
        { shallow: true }
      )
    })
  })

  it('should render Cloudflare', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    render(
      <MockedProvider>
        <VideoLibrary open />
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Upload' }))
    await waitFor(() => {
      expect(screen.getByText('Drop a video here')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'video-upload' }
        },
        undefined,
        { shallow: true }
      )
    })
  })
})
