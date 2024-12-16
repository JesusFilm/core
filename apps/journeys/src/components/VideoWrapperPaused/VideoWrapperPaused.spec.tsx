import { render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { Video } from '@core/journeys/ui/Video'

import { VideoBlockSource } from '../../../__generated__/globalTypes'

import { VideoWrapperPaused } from './VideoWrapperPaused'

jest.mock('@core/journeys/ui/Video', () => ({
  __esModule: true,
  Video: jest.fn(() => <></>)
}))

describe('VideoWrapper', () => {
  it('should set videoId to null', () => {
    const block: TreeBlock = {
      id: 'video5.id',
      __typename: 'VideoBlock',
      parentBlockId: 'card5.id',
      parentOrder: 0,
      autoplay: false,
      muted: true,
      videoId: '2_0-FallingPlates',
      videoVariantLanguageId: '529',
      source: VideoBlockSource.internal,
      title: null,
      description: null,
      duration: null,
      image: null,
      mediaVideo: null,
      startAt: null,
      endAt: null,
      posterBlockId: 'image5.id',
      fullsize: null,
      action: null,
      objectFit: null,
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
          blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ',
          scale: null,
          focalLeft: 50,
          focalTop: 50
        }
      ]
    }
    render(
      <VideoWrapperPaused block={block}>
        <></>
      </VideoWrapperPaused>
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
            width: 1920,
            scale: null,
            focalLeft: 50,
            focalTop: 50
          }
        ],
        endAt: null,
        fullsize: null,
        action: null,
        id: 'video5.id',
        muted: true,
        parentBlockId: 'card5.id',
        parentOrder: 0,
        posterBlockId: 'image5.id',
        startAt: null,
        source: VideoBlockSource.internal,
        title: null,
        description: null,
        duration: null,
        image: null,
        objectFit: null,
        mediaVideo: null,
        videoId: null,
        videoVariantLanguageId: '529'
      },
      {}
    )
  })

  it('should handle where videoId is not set', () => {
    const block: TreeBlock = {
      id: 'video5.id',
      __typename: 'VideoBlock',
      parentBlockId: 'card5.id',
      parentOrder: 0,
      autoplay: false,
      muted: true,
      videoId: null,
      videoVariantLanguageId: '529',
      source: VideoBlockSource.internal,
      title: null,
      description: null,
      duration: null,
      image: null,
      mediaVideo: null,
      startAt: null,
      endAt: null,
      posterBlockId: 'image5.id',
      fullsize: null,
      action: null,
      objectFit: null,
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
          blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ',
          scale: null,
          focalLeft: 50,
          focalTop: 50
        }
      ]
    }
    render(
      <VideoWrapperPaused block={block}>
        <></>
      </VideoWrapperPaused>
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
            width: 1920,
            scale: null,
            focalLeft: 50,
            focalTop: 50
          }
        ],
        endAt: null,
        fullsize: null,
        action: null,
        id: 'video5.id',
        muted: true,
        parentBlockId: 'card5.id',
        parentOrder: 0,
        posterBlockId: 'image5.id',
        startAt: null,
        source: VideoBlockSource.internal,
        title: null,
        description: null,
        duration: null,
        image: null,
        objectFit: null,
        mediaVideo: null,
        videoId: null,
        videoVariantLanguageId: '529'
      },
      {}
    )
  })
})
