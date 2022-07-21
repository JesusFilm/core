import { fireEvent, render } from '@testing-library/react'
import type { TreeBlock } from '@core/journeys/ui/block'
import { MockedProvider } from '@apollo/client/testing'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { ThemeProvider } from '../../ThemeProvider'
import { VideoBlockEditor } from '.'

const video: TreeBlock<VideoBlock> = {
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
    },
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
  },
  posterBlockId: null,
  children: []
}

describe('VideoBlockEditor', () => {
  describe('no existing block', () => {
    it('shows placeholders on null', () => {
      const { getByText } = render(
        <ThemeProvider>
          <MockedProvider>
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

  describe('existing block', () => {
    it('shows title and language', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <MockedProvider>
            <VideoBlockEditor
              selectedBlock={video}
              onChange={jest.fn()}
              onDelete={jest.fn()}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      expect(getByText('FallingPlates')).toBeInTheDocument()
      expect(getByText('English')).toBeInTheDocument()
    })

    it('shows title and language (with local only)', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <MockedProvider>
            <VideoBlockEditor
              selectedBlock={{
                ...video,
                video: {
                  ...video.video,
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
      expect(getByText('English')).toBeInTheDocument()
    })

    it('shows title and language (with native)', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <MockedProvider>
            <VideoBlockEditor
              selectedBlock={{
                ...video,
                video: {
                  ...video.video,
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
                } as unknown as VideoBlock['video']
              }}
              onChange={jest.fn()}
              onDelete={jest.fn()}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      expect(getByText('FallingPlates')).toBeInTheDocument()
      expect(getByText('English (English 2)')).toBeInTheDocument()
    })

    it('shows title and language (only shows local when the same as native)', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <MockedProvider>
            <VideoBlockEditor
              selectedBlock={{
                ...video,
                video: {
                  ...video.video,
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
      expect(getByText('English')).toBeInTheDocument()
    })

    it('calls onDelete', async () => {
      const onDelete = jest.fn()
      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider>
            <VideoBlockEditor
              selectedBlock={video}
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

    it('has settings enabled', async () => {
      const { getByRole } = render(
        <ThemeProvider>
          <MockedProvider>
            <VideoBlockEditor
              selectedBlock={video}
              onChange={jest.fn()}
              onDelete={jest.fn()}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      expect(getByRole('checkbox', { name: 'Autoplay' })).toBeEnabled()
    })
  })
})
