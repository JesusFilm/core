import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../../__generated__/BlockFields'
import {
  CoverBlockDelete,
  CoverBlockDeleteVariables
} from '../../../../../../../../../../__generated__/CoverBlockDelete'
import {
  CoverBlockRestore,
  CoverBlockRestoreVariables
} from '../../../../../../../../../../__generated__/CoverBlockRestore'
import { GetJourney_journey as Journey } from '../../../../../../../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../../../../../../../__generated__/globalTypes'
import { COVER_BLOCK_DELETE } from '../../../../../../../../../libs/useCoverBlockDeleteMutation/useCoverBlockDeleteMutation'
import { COVER_BLOCK_RESTORE } from '../../../../../../../../../libs/useCoverBlockRestoreMutation/useCoverBlockRestoreMutation'
import { ThemeProvider } from '../../../../../../../../ThemeProvider'
import { CommandRedoItem } from '../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { BackgroundMedia } from './BackgroundMedia'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    query: { tab: 'active' },
    push: jest.fn(),
    events: {
      on: jest.fn()
    }
  }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const journey = { id: 'journeyId' } as unknown as Journey

const card: TreeBlock<CardBlock> = {
  id: 'card1.id',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  backdropBlur: null,
  children: []
}
const video: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  startAt: 0,
  endAt: null,
  muted: false,
  autoplay: true,
  fullsize: false,
  action: null,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  duration: null,
  image: null,
  objectFit: null,
  mediaVideo: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'VideoTitle',
        value: 'FallingPlates'
      }
    ],
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    },
    variantLanguages: []
  },
  posterBlockId: 'poster1.id',
  children: []
}

const image: TreeBlock<ImageBlock> = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: '3',
  parentOrder: 0,
  src: 'https://source.unsplash.com/random/1920x1080',
  alt: 'random image from unsplash',
  width: 1920,
  height: 1080,
  blurhash: '',
  scale: 100,
  children: [],
  focalLeft: 50,
  focalTop: 50
}

const coverVideoBlockDeleteMock: MockedResponse<
  CoverBlockDelete,
  CoverBlockDeleteVariables
> = {
  request: {
    query: COVER_BLOCK_DELETE,
    variables: {
      id: video.id,
      cardBlockId: card.id
    }
  },
  result: {
    data: {
      blockDelete: [
        {
          id: video.id,
          __typename: 'VideoBlock',
          parentOrder: null
        }
      ],
      cardBlockUpdate: {
        id: card.id,
        coverBlockId: null,
        __typename: 'CardBlock'
      }
    }
  }
}

const coverVideoBlockRestoreMock: MockedResponse<
  CoverBlockRestore,
  CoverBlockRestoreVariables
> = {
  request: {
    query: COVER_BLOCK_RESTORE,
    variables: {
      id: video.id,
      cardBlockId: card.id
    }
  },
  result: {
    data: {
      blockRestore: [video],
      cardBlockUpdate: {
        id: card.id,
        coverBlockId: video.id,
        __typename: 'CardBlock'
      }
    }
  }
}

const coverImageBlockDeleteMock: MockedResponse<
  CoverBlockDelete,
  CoverBlockDeleteVariables
> = {
  request: {
    query: COVER_BLOCK_DELETE,
    variables: {
      id: image.id,
      cardBlockId: card.id
    }
  },
  result: {
    data: {
      blockDelete: [
        {
          id: image.id,
          __typename: 'ImageBlock',
          parentOrder: null
        }
      ],
      cardBlockUpdate: {
        id: card.id,
        coverBlockId: null,
        __typename: 'CardBlock'
      }
    }
  }
}

const coverImageBlockRestoreMock: MockedResponse<
  CoverBlockRestore,
  CoverBlockRestoreVariables
> = {
  request: {
    query: COVER_BLOCK_RESTORE,
    variables: {
      id: image.id,
      cardBlockId: card.id
    }
  },
  result: {
    data: {
      blockRestore: [image],
      cardBlockUpdate: {
        id: card.id,
        coverBlockId: image.id,
        __typename: 'CardBlock'
      }
    }
  }
}

describe('BackgroundMedia', () => {
  it('shows Video selected on null cover', () => {
    render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <SnackbarProvider>
                <BackgroundMedia />
              </SnackbarProvider>
            </EditorProvider>
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      screen
        .getByTestId('bgvideo-video-tab')
        .attributes.getNamedItem('aria-pressed')
    ).toBeTruthy()
    fireEvent.click(screen.getByTestId('bgvideo-video-tab'))
  })

  it('shows Video selected', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: `CardBlock:${card.id}` },
          { __ref: `VideoBlock:${video.id}` }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })
    render(
      <MockedProvider
        cache={cache}
        mocks={[
          coverVideoBlockDeleteMock,
          coverVideoBlockRestoreMock,
          coverVideoBlockDeleteMock
        ]}
      >
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <EditorProvider
              initialState={{
                selectedBlock: {
                  ...card,
                  coverBlockId: video.id,
                  children: [video]
                }
              }}
            >
              <SnackbarProvider>
                <CommandProvider>
                  <BackgroundMedia />
                  <CommandUndoItem variant="button" />
                  <CommandRedoItem variant="button" />
                </CommandProvider>
              </SnackbarProvider>
            </EditorProvider>
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      screen
        .getByTestId('bgvideo-video-tab')
        .attributes.getNamedItem('aria-pressed')
    ).toBeTruthy()
    fireEvent.click(screen.getByTestId('bgvideo-image-tab'))
    await waitFor(() =>
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` }
      ])
    )
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` },
        { __ref: `VideoBlock:${video.id}` }
      ])
    )
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() =>
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` }
      ])
    )
  })

  it('shows Image selected', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: `CardBlock:${card.id}` },
          { __ref: `ImageBlock:${image.id}` }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })
    const step: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: 'journeyId',
      locked: false,
      nextBlockId: null,
      parentOrder: 0,
      slug: null,
      children: [{ ...card, coverBlockId: image.id, children: [image] }]
    }
    render(
      <MockedProvider
        cache={cache}
        mocks={[
          coverImageBlockDeleteMock,
          coverImageBlockRestoreMock,
          coverImageBlockDeleteMock
        ]}
      >
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <EditorProvider initialState={{ selectedBlock: step }}>
              <SnackbarProvider>
                <CommandProvider>
                  <BackgroundMedia />
                  <CommandUndoItem variant="button" />
                  <CommandRedoItem variant="button" />
                </CommandProvider>
              </SnackbarProvider>
            </EditorProvider>
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      screen
        .getByTestId('bgvideo-image-tab')
        .attributes.getNamedItem('aria-pressed')
    ).toBeTruthy()
    fireEvent.click(screen.getByTestId('bgvideo-video-tab'))
    await waitFor(() =>
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` }
      ])
    )
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` },
        { __ref: `ImageBlock:${image.id}` }
      ])
    )
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() =>
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` }
      ])
    )
  })

  it('updates the url parameters', async () => {
    const push = jest.fn()
    const on = jest.fn()

    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <SnackbarProvider>
                <BackgroundMedia />
              </SnackbarProvider>
            </EditorProvider>
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      screen
        .getByTestId('bgvideo-video-tab')
        .attributes.getNamedItem('aria-pressed')
    ).toBeTruthy()
    fireEvent.click(screen.getByTestId('bgvideo-image-tab'))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'background-image' }
        },
        undefined,
        { shallow: true }
      )
    })
    fireEvent.click(screen.getByTestId('bgvideo-video-tab'))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'background-video' }
        },
        undefined,
        { shallow: true }
      )
    })
  })
})
