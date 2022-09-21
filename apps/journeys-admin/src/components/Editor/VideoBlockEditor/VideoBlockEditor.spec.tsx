import { fireEvent, render, waitFor } from '@testing-library/react'
import type { TreeBlock } from '@core/journeys/ui/block'
import { MockedProvider } from '@apollo/client/testing'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { GetVideoVariantLanguages_video } from '../../../../__generated__/GetVideoVariantLanguages'
import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../ThemeProvider'
import { GET_VIDEO_VARIANT_LANGUAGES } from './VideoBlockEditor'
import { VideoBlockEditor } from '.'

const videoInternal: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  startAt: 0,
  endAt: null,
  muted: true,
  autoplay: true,
  fullsize: true,
  action: null,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  duration: null,
  image: null,
  video: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'Translation',
        value: 'FallingPlates'
      }
    ],
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    }
  },
  posterBlockId: null,
  children: []
}

const videoLanguages: GetVideoVariantLanguages_video = {
  __typename: 'Video',
  id: '2_0-FallingPlates',
  variantLanguages: [
    {
      __typename: 'Language',
      id: '529',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    }
  ]
}

const mocks = [
  {
    request: {
      query: GET_VIDEO_VARIANT_LANGUAGES,
      variables: {
        id: videoLanguages.id
      }
    },
    result: {
      data: {
        video: videoLanguages
      }
    }
  }
]

const videoYouTube: TreeBlock<VideoBlock> = {
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
  posterBlockId: 'poster1.id',
  children: []
}

describe('VideoBlockEditor', () => {
  describe('no existing block', () => {
    it('shows placeholders on null', () => {
      const { getByText } = render(
        <ThemeProvider>
          <MockedProvider mocks={mocks}>
            <VideoBlockEditor
              selectedBlock={null}
              onChange={jest.fn()}
              onDelete={jest.fn()}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      expect(getByText('Select Video File')).toBeInTheDocument()
    })
  })

  describe('video internal source', () => {
    it('shows title and language', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <MockedProvider mocks={mocks}>
            <VideoBlockEditor
              selectedBlock={videoInternal}
              onChange={jest.fn()}
              onDelete={jest.fn()}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      expect(getByText('FallingPlates')).toBeInTheDocument()
      await waitFor(() => expect(getByText('English')).toBeInTheDocument())
    })

    it('shows title and language (with local only)', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <MockedProvider mocks={mocks}>
            <VideoBlockEditor
              selectedBlock={{
                ...videoInternal,
                video: {
                  ...videoInternal.video,
                  variantLanguages: [
                    {
                      __typename: 'Language',
                      id: '529',
                      name: [
                        {
                          __typename: 'Translation',
                          value: 'English',
                          primary: false
                        }
                      ]
                    }
                  ]
                } as unknown as VideoBlock['video']
              }}
              onChange={jest.fn()}
              onDelete={jest.fn()}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      expect(getByText('FallingPlates')).toBeInTheDocument()
      await waitFor(() => expect(getByText('English')).toBeInTheDocument())
    })

    it('shows title and language (with native)', async () => {
      const mocks = [
        {
          request: {
            query: GET_VIDEO_VARIANT_LANGUAGES,
            variables: {
              id: videoLanguages.id
            }
          },
          result: {
            data: {
              video: {
                variantLanguages: [
                  {
                    __typename: 'Language',
                    id: '529',
                    name: [
                      {
                        __typename: 'Translation',
                        value: 'English 2',
                        primary: true
                      },
                      {
                        __typename: 'Translation',
                        value: 'English',
                        primary: false
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      ]
      const { getByText } = render(
        <ThemeProvider>
          <MockedProvider mocks={mocks}>
            <VideoBlockEditor
              selectedBlock={{
                ...videoInternal,
                video: {
                  ...videoInternal.video
                } as unknown as VideoBlock['video']
              }}
              onChange={jest.fn()}
              onDelete={jest.fn()}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      expect(getByText('FallingPlates')).toBeInTheDocument()
      await waitFor(() =>
        expect(getByText('English (English 2)')).toBeInTheDocument()
      )
    })

    it('shows title and language (only shows local when the same as native)', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <MockedProvider mocks={mocks}>
            <VideoBlockEditor
              selectedBlock={{
                ...videoInternal,
                video: {
                  ...videoInternal.video,
                  variantLanguages: [
                    {
                      __typename: 'Language',
                      id: '529',
                      name: [
                        {
                          __typename: 'Translation',
                          value: 'English',
                          primary: true
                        },
                        {
                          __typename: 'Translation',
                          value: 'English',
                          primary: false
                        }
                      ]
                    }
                  ]
                } as unknown as VideoBlock['video']
              }}
              onChange={jest.fn()}
              onDelete={jest.fn()}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      expect(getByText('FallingPlates')).toBeInTheDocument()
      await waitFor(() => expect(getByText('English')).toBeInTheDocument())
    })

    it('calls onDelete', async () => {
      const onDelete = jest.fn()
      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider mocks={mocks}>
            <VideoBlockEditor
              selectedBlock={videoInternal}
              onChange={jest.fn()}
              onDelete={onDelete}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      const button = await getByTestId('imageBlockHeaderDelete')
      fireEvent.click(button)
      expect(onDelete).toHaveBeenCalledWith()
    })
  })

  describe('video youTube source', () => {
    it('shows title', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <MockedProvider mocks={mocks}>
            <VideoBlockEditor
              selectedBlock={videoYouTube}
              onChange={jest.fn()}
              onDelete={jest.fn()}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      expect(getByText('What is the Bible?')).toBeInTheDocument()
    })

    it('calls onDelete', async () => {
      const onDelete = jest.fn()
      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider mocks={mocks}>
            <VideoBlockEditor
              selectedBlock={videoYouTube}
              onChange={jest.fn()}
              onDelete={onDelete}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      const button = await getByTestId('imageBlockHeaderDelete')
      fireEvent.click(button)
      expect(onDelete).toHaveBeenCalledWith()
    })
  })

  it('has settings enabled', async () => {
    const { getByRole } = render(
      <ThemeProvider>
        <MockedProvider mocks={mocks}>
          <VideoBlockEditor
            selectedBlock={videoInternal}
            onChange={jest.fn()}
            onDelete={jest.fn()}
          />
        </MockedProvider>
      </ThemeProvider>
    )
    expect(getByRole('checkbox', { name: 'Autoplay' })).toBeEnabled()
  })
})
