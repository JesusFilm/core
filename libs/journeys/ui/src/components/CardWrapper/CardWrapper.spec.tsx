import { render } from '@testing-library/react'
import { ReactElement } from 'react'

import { VideoBlockSource } from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'
import { Card } from '../Card'

import { CardWrapper } from '.'

jest.mock('@core/journeys/ui/Card', () => ({
  __esModule: true,
  Card: jest.fn(() => <></>)
}))

describe('CardWrapper', () => {
  it('should set videoId to null', () => {
    const Container = (_props: {
      wrappers: Record<string, never>
    }): ReactElement => <></>
    const block: TreeBlock = {
      id: 'card5.id',
      __typename: 'CardBlock',
      parentBlockId: 'step5.id',
      coverBlockId: 'video5.id',
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: [
        {
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
      ]
    }
    render(
      <CardWrapper block={block}>
        <Container wrappers={{}} />
      </CardWrapper>
    )
    expect(Card).toHaveBeenCalledWith(
      {
        __typename: 'CardBlock',
        backgroundColor: null,
        children: [
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
            objectFit: null,
            image: null,
            mediaVideo: null,
            videoId: null,
            videoVariantLanguageId: '529'
          }
        ],
        coverBlockId: 'video5.id',
        fullscreen: false,
        backdropBlur: null,
        id: 'card5.id',
        parentBlockId: 'step5.id',
        parentOrder: 0,
        themeMode: null,
        themeName: null,
        wrappers: {}
      },
      {}
    )
  })

  it('should handle where videoId is not set', () => {
    const Container = (_props: {
      wrappers: Record<string, never>
    }): ReactElement => <></>
    const block: TreeBlock = {
      id: 'card5.id',
      __typename: 'CardBlock',
      parentBlockId: 'step5.id',
      coverBlockId: 'video5.id',
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: [
        {
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
      ]
    }
    render(
      <CardWrapper block={block}>
        <Container wrappers={{}} />
      </CardWrapper>
    )
    expect(Card).toHaveBeenCalledWith(
      {
        __typename: 'CardBlock',
        backgroundColor: null,
        children: [
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
            objectFit: null,
            duration: null,
            image: null,
            mediaVideo: null,
            videoId: null,
            videoVariantLanguageId: '529'
          }
        ],
        coverBlockId: 'video5.id',
        fullscreen: false,
        backdropBlur: null,
        id: 'card5.id',
        parentBlockId: 'step5.id',
        parentOrder: 0,
        themeMode: null,
        themeName: null,
        wrappers: {}
      },
      {}
    )
  })
})
