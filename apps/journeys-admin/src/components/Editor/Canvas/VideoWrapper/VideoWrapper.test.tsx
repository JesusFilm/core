import { render } from '@testing-library/react'
import type { TreeBlock } from '@core/journeys/ui'
import { Video } from '@core/journeys/ui'
import { VideoWrapper } from '.'

jest.mock('@core/journeys/ui', () => ({
  __esModule: true,
  Video: jest.fn(() => <></>)
}))

describe('VideoWrapper', () => {
  it('should set variant hls in video cover block to null', () => {
    const block: TreeBlock = {
      id: 'video5.id',
      __typename: 'VideoBlock',
      parentBlockId: 'card5.id',
      parentOrder: 0,
      autoplay: false,
      muted: true,
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
        variant: {
          __typename: 'VideoVariant',
          id: '2_0-FallingPlates-529',
          hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
        }
      },
      startAt: null,
      endAt: null,
      posterBlockId: 'image5.id',
      fullsize: null,
      children: [
        {
          id: 'image5.id',
          __typename: 'ImageBlock',
          src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          width: 1920,
          height: 1080,
          alt: 'random image from unsplash',
          parentBlockId: 'video5.id',
          parentOrder: 0,
          children: [],
          blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
        }
      ]
    }
    render(
      <VideoWrapper block={block}>
        <></>
      </VideoWrapper>
    )
    expect(Video).toHaveBeenCalledWith(
      {
        __typename: 'VideoBlock',
        autoplay: false,
        children: [
          {
            __typename: 'ImageBlock',
            alt: 'random image from unsplash',
            blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ',
            children: [],
            height: 1080,
            id: 'image5.id',
            parentBlockId: 'video5.id',
            parentOrder: 0,
            src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            width: 1920
          }
        ],
        endAt: null,
        fullsize: null,
        id: 'video5.id',
        muted: true,
        parentBlockId: 'card5.id',
        parentOrder: 0,
        posterBlockId: 'image5.id',
        startAt: null,
        video: {
          __typename: 'Video',
          id: '2_0-FallingPlates',
          title: [
            {
              __typename: 'Translation',
              value: 'FallingPlates'
            }
          ],
          variant: {
            __typename: 'VideoVariant',
            hls: null,
            id: '2_0-FallingPlates-529'
          }
        },
        videoId: '2_0-FallingPlates',
        videoVariantLanguageId: '529'
      },
      {}
    )
  })

  it('should handle where video is not set', () => {
    const block: TreeBlock = {
      id: 'video5.id',
      __typename: 'VideoBlock',
      parentBlockId: 'card5.id',
      parentOrder: 0,
      autoplay: false,
      muted: true,
      videoId: '2_0-FallingPlates',
      videoVariantLanguageId: '529',
      video: null,
      startAt: null,
      endAt: null,
      posterBlockId: 'image5.id',
      fullsize: null,
      children: [
        {
          id: 'image5.id',
          __typename: 'ImageBlock',
          src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          width: 1920,
          height: 1080,
          alt: 'random image from unsplash',
          parentBlockId: 'video5.id',
          parentOrder: 0,
          children: [],
          blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
        }
      ]
    }
    render(
      <VideoWrapper block={block}>
        <></>
      </VideoWrapper>
    )
    expect(Video).toHaveBeenCalledWith(
      {
        __typename: 'VideoBlock',
        autoplay: false,
        children: [
          {
            __typename: 'ImageBlock',
            alt: 'random image from unsplash',
            blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ',
            children: [],
            height: 1080,
            id: 'image5.id',
            parentBlockId: 'video5.id',
            parentOrder: 0,
            src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            width: 1920
          }
        ],
        endAt: null,
        fullsize: null,
        id: 'video5.id',
        muted: true,
        parentBlockId: 'card5.id',
        parentOrder: 0,
        posterBlockId: 'image5.id',
        startAt: null,
        video: null,
        videoId: '2_0-FallingPlates',
        videoVariantLanguageId: '529'
      },
      {}
    )
  })

  it('should handle where video variant is not set', () => {
    const block: TreeBlock = {
      id: 'video5.id',
      __typename: 'VideoBlock',
      parentBlockId: 'card5.id',
      parentOrder: 0,
      autoplay: false,
      muted: true,
      videoId: '2_0-FallingPlates',
      videoVariantLanguageId: '529',
      title: [
        {
          __typename: 'Translation',
          value: 'FallingPlates'
        }
      ],
      video: {
        __typename: 'Video',
        id: '2_0-FallingPlates',
        variant: null
      },
      startAt: null,
      endAt: null,
      posterBlockId: 'image5.id',
      fullsize: null,
      children: [
        {
          id: 'image5.id',
          __typename: 'ImageBlock',
          src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          width: 1920,
          height: 1080,
          alt: 'random image from unsplash',
          parentBlockId: 'video5.id',
          parentOrder: 0,
          children: [],
          blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
        }
      ]
    }
    render(
      <VideoWrapper block={block}>
        <></>
      </VideoWrapper>
    )
    expect(Video).toHaveBeenCalledWith(
      {
        __typename: 'VideoBlock',
        autoplay: false,
        children: [
          {
            __typename: 'ImageBlock',
            alt: 'random image from unsplash',
            blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ',
            children: [],
            height: 1080,
            id: 'image5.id',
            parentBlockId: 'video5.id',
            parentOrder: 0,
            src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            width: 1920
          }
        ],
        endAt: null,
        fullsize: null,
        id: 'video5.id',
        muted: true,
        parentBlockId: 'card5.id',
        parentOrder: 0,
        posterBlockId: 'image5.id',
        startAt: null,
        video: {
          __typename: 'Video',
          id: '2_0-FallingPlates',
          variant: null
        },
        videoId: '2_0-FallingPlates',
        videoVariantLanguageId: '529'
      },
      {}
    )
  })
})
