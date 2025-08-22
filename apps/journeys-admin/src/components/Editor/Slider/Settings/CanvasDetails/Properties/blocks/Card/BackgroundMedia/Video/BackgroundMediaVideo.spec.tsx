import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { InfiniteHitsRenderState } from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { SnackbarProvider } from 'notistack'
import {
  InstantSearchApi,
  useInfiniteHits,
  useInstantSearch,
  useSearchBox
} from 'react-instantsearch'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../../../__generated__/BlockFields'
import {
  CoverBlockDelete,
  CoverBlockDeleteVariables
} from '../../../../../../../../../../../__generated__/CoverBlockDelete'
import {
  CoverBlockRestore,
  CoverBlockRestoreVariables
} from '../../../../../../../../../../../__generated__/CoverBlockRestore'
import {
  CoverVideoBlockCreate,
  CoverVideoBlockCreateVariables
} from '../../../../../../../../../../../__generated__/CoverVideoBlockCreate'
import {
  CoverVideoBlockUpdate,
  CoverVideoBlockUpdateVariables
} from '../../../../../../../../../../../__generated__/CoverVideoBlockUpdate'
import { GetJourney_journey as Journey } from '../../../../../../../../../../../__generated__/GetJourney'
import {
  GetVideo,
  GetVideoVariables
} from '../../../../../../../../../../../__generated__/GetVideo'
import { VideoBlockSource } from '../../../../../../../../../../../__generated__/globalTypes'
import { COVER_BLOCK_DELETE } from '../../../../../../../../../../libs/useCoverBlockDeleteMutation/useCoverBlockDeleteMutation'
import { COVER_BLOCK_RESTORE } from '../../../../../../../../../../libs/useCoverBlockRestoreMutation/useCoverBlockRestoreMutation'
import { ThemeProvider } from '../../../../../../../../../ThemeProvider'
import { CommandRedoItem } from '../../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../../Toolbar/Items/CommandUndoItem'
import { videoItems } from '../../../../../../Drawer/VideoLibrary/data'
import { GET_VIDEO } from '../../../../../../Drawer/VideoLibrary/VideoFromLocal/LocalDetails/LocalDetails'
import { GET_VIDEO_VARIANT_LANGUAGES } from '../../../../../../Drawer/VideoBlockEditor/Source/SourceFromLocal/SourceFromLocal'

import {
  COVER_VIDEO_BLOCK_CREATE,
  COVER_VIDEO_BLOCK_UPDATE
} from './BackgroundMediaVideo'

import { BackgroundMediaVideo } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

jest.mock('react-instantsearch')

// Silence video.js in JSDOM and avoid player init errors
jest.mock('video.js', () => {
  const mockPlayer = {
    src: jest.fn(),
    dispose: jest.fn(),
    on: jest.fn(),
    ready: jest.fn((cb?: () => void) => (cb?.(), undefined)),
    controls: jest.fn(),
    paused: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    error: jest.fn(),
    currentTime: jest.fn(),
    aspectRatio: jest.fn(),
    autoresize: jest.fn(),
    preload: jest.fn(),
    muted: jest.fn(),
    volume: jest.fn(),
    poster: jest.fn()
  }
  const videojs = jest.fn(() => mockPlayer)
  ;(videojs as any).getPlayers = () => ({})
  ;(videojs as any).log = { warn: jest.fn(), error: jest.fn() }
  return videojs
})

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>
const mockUseInstantSearch = useInstantSearch as jest.MockedFunction<
  typeof useInstantSearch
>
const mockUseInfiniteHits = useInfiniteHits as jest.MockedFunction<
  typeof useInfiniteHits
>

const journey = { id: 'journeyId' } as unknown as Journey

const card: TreeBlock<CardBlock> = {
  id: 'cardId',
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
  id: 'videoId',
  __typename: 'VideoBlock',
  parentBlockId: 'cardId',
  parentOrder: 0,
  startAt: 0,
  endAt: 144,
  muted: true,
  autoplay: true,
  fullsize: true,
  action: null,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  duration: 144,
  objectFit: null,
  image: null,
  mediaVideo: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'VideoTitle',
        value: '#FallingPlates'
      }
    ],
    images: [],
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/zbrvj'
    },
    variantLanguages: []
  },
  posterBlockId: null,
  children: []
}

const getVideoMock: MockedResponse<GetVideo, GetVideoVariables> = {
  request: {
    query: GET_VIDEO,
    variables: {
      id: 'videoId',
      languageId: '529'
    }
  },
  result: {
    data: {
      video: {
        __typename: 'Video',
        id: 'videoId',
        images: [],
        primaryLanguageId: '529',
        title: [
          {
            primary: true,
            value: 'Jesus Taken Up Into Heaven',
            __typename: 'VideoTitle'
          }
        ],
        description: [
          {
            primary: true,
            value:
              'Jesus promises the Holy Spirit; then ascends into the clouds.',
            __typename: 'VideoDescription'
          }
        ],
        variant: {
          id: 'variantA',
          duration: 144,
          hls: 'https://arc.gt/opsgn',
          __typename: 'VideoVariant'
        },
        variantLanguages: [
          {
            __typename: 'Language',
            slug: 'english',
            id: '529',
            name: [
              {
                value: 'English',
                primary: true,
                __typename: 'LanguageName'
              }
            ]
          }
        ]
      }
    }
  }
}

const getExistingCoverVideoMock: MockedResponse<GetVideo, GetVideoVariables> = {
  request: {
    query: GET_VIDEO,
    variables: {
      id: '2_0-FallingPlates',
      languageId: '529'
    }
  },
  result: {
    data: {
      video: {
        __typename: 'Video',
        id: '2_0-FallingPlates',
        images: [],
        primaryLanguageId: '529',
        title: [
          {
            primary: true,
            value: '#FallingPlates',
            __typename: 'VideoTitle'
          }
        ],
        description: [
          {
            primary: true,
            value: 'Falling Plates description',
            __typename: 'VideoDescription'
          }
        ],
        variant: {
          id: '2_0-FallingPlates-529',
          duration: 144,
          hls: 'https://arc.gt/zbrvj',
          __typename: 'VideoVariant'
        },
        variantLanguages: [
          {
            __typename: 'Language',
            slug: 'english',
            id: '529',
            name: [
              {
                value: 'English',
                primary: true,
                __typename: 'LanguageName'
              }
            ]
          }
        ]
      }
    }
  }
}

const getVariantLanguagesMock: MockedResponse<any> = {
  request: {
    query: GET_VIDEO_VARIANT_LANGUAGES,
    variables: { id: '2_0-FallingPlates' }
  },
  result: {
    data: {
      video: {
        __typename: 'Video',
        id: '2_0-FallingPlates',
        variant: { __typename: 'VideoVariant', id: '2_0-FallingPlates-529' },
        variantLanguages: [
          {
            __typename: 'Language',
            id: '529',
            name: [
              { __typename: 'LanguageName', value: 'English', primary: true }
            ]
          }
        ]
      }
    }
  }
}

const coverVideoBlockCreateMock: MockedResponse<
  CoverVideoBlockCreate,
  CoverVideoBlockCreateVariables
> = {
  request: {
    query: COVER_VIDEO_BLOCK_CREATE,
    variables: {
      id: video.id,
      cardBlockId: card.id,
      input: {
        journeyId: journey.id,
        id: video.id,
        parentBlockId: card.id,
        videoId: 'videoId',
        videoVariantLanguageId: '529',
        source: VideoBlockSource.internal,
        startAt: 0,
        endAt: 144,
        isCover: true,
        duration: 144
      }
    }
  },
  result: {
    data: {
      videoBlockCreate: {
        ...video
      },
      cardBlockUpdate: {
        id: card.id,
        coverBlockId: video.id,
        __typename: 'CardBlock'
      }
    }
  }
}

const coverBlockDeleteMock: MockedResponse<
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

const coverBlockRestoreMock: MockedResponse<
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

describe('BackgroundMediaVideo', () => {
  const searchBox = {
    refine: jest.fn()
  } as unknown as SearchBoxRenderState

  const infiniteHits = {
    items: videoItems,
    showMore: jest.fn(),
    isLastPage: false
  } as unknown as InfiniteHitsRenderState

  const instantSearch = {
    status: 'idle',
    results: {
      __isArtificial: false,
      nbHits: videoItems.length
    }
  } as unknown as InstantSearchApi

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue(searchBox)
    mockUseInfiniteHits.mockReturnValue(infiniteHits)
    mockUseInstantSearch.mockReturnValue(instantSearch)
    jest.clearAllMocks()
  })

  it('creates a new video cover block', async () => {
    mockUuidv4.mockReturnValueOnce(video.id)
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'CardBlock:cardId' }],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'CardBlock:cardId': { ...card }
    })
    const getVideoResult = jest.fn().mockReturnValue(getVideoMock.result)
    render(
      <MockedProvider
        cache={cache}
        mocks={[
          { ...getVideoMock, result: getVideoResult },
          getVariantLanguagesMock,
          getVariantLanguagesMock,
          coverVideoBlockCreateMock,
          coverBlockDeleteMock,
          coverBlockRestoreMock
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <ThemeProvider>
            <SnackbarProvider>
              <EditorProvider initialState={{ selectedAttributeId: video.id }}>
                <CommandProvider>
                  <BackgroundMediaVideo cardBlock={card} />
                  <CommandUndoItem variant="button" />
                  <CommandRedoItem variant="button" />
                </CommandProvider>
              </EditorProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Select Video' }))
    )
    await waitFor(() => fireEvent.click(screen.getByText('title1')))
    await waitFor(() => expect(getVideoResult).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Select' }))
    await waitFor(() =>
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` },
        { __ref: `VideoBlock:${video.id}` }
      ])
    )
    expect(cache.extract()[`CardBlock:${card.id}`]?.coverBlockId).toEqual(
      video.id
    )
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` }
      ])
    )
    expect(cache.extract()[`CardBlock:${card.id}`]?.coverBlockId).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() =>
      expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
        { __ref: `CardBlock:${card.id}` },
        { __ref: `VideoBlock:${video.id}` }
      ])
    )
    expect(cache.extract()[`CardBlock:${card.id}`]?.coverBlockId).toEqual(
      video.id
    )
  })

  describe('Existing video cover', () => {
    const existingCoverBlock: TreeBlock<CardBlock> = {
      ...card,
      coverBlockId: video.id,
      children: [video]
    }

    it('updates video cover block', async () => {
      const getVideoResult = jest.fn().mockReturnValue(getVideoMock.result)
      const response: CoverVideoBlockUpdate = {
        videoBlockUpdate: {
          ...video
        }
      }
      const coverVideoBlockUpdateMock: MockedResponse<
        CoverVideoBlockUpdate,
        CoverVideoBlockUpdateVariables
      > = {
        request: {
          query: COVER_VIDEO_BLOCK_UPDATE,
          variables: {
            id: video.id,
            input: {
              videoId: 'videoId',
              videoVariantLanguageId: '529',
              duration: 144,
              source: VideoBlockSource.internal,
              startAt: 0,
              endAt: 144
            }
          }
        },
        result: {
          data: response
        }
      }
      const updateResult = jest.fn(() => ({
        data: response
      }))
      const undoResult = jest.fn(() => ({
        data: response
      }))
      const redoResult = jest.fn(() => ({
        data: response
      }))
      render(
        <MockedProvider
          mocks={[
            { ...getExistingCoverVideoMock },
            { ...getVideoMock, result: getVideoResult },
            getVariantLanguagesMock,
            getVariantLanguagesMock,
            {
              ...coverVideoBlockUpdateMock,
              result: updateResult
            },
            {
              ...coverVideoBlockUpdateMock,
              request: {
                ...coverVideoBlockUpdateMock.request,
                variables: {
                  ...coverVideoBlockUpdateMock.request.variables,
                  input: {
                    ...coverVideoBlockUpdateMock.request.variables?.input,
                    videoId: '2_0-FallingPlates',
                    videoVariantLanguageId: '529',
                    duration: 144,
                    source: VideoBlockSource.internal,
                    startAt: 0,
                    endAt: 144
                  }
                }
              },
              result: undoResult
            },
            {
              ...coverVideoBlockUpdateMock,
              result: redoResult
            }
          ]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <ThemeProvider>
              <SnackbarProvider>
                <EditorProvider
                  initialState={{ selectedAttributeId: video.id }}
                >
                  <CommandProvider>
                    <BackgroundMediaVideo cardBlock={existingCoverBlock} />
                    <CommandUndoItem variant="button" />
                    <CommandRedoItem variant="button" />
                  </CommandProvider>
                </EditorProvider>
              </SnackbarProvider>
            </ThemeProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        fireEvent.click(
          screen.getByRole('button', { name: '#FallingPlates #FallingPlates' })
        )
      )
      await waitFor(() =>
        expect(screen.getByText('title1')).toBeInTheDocument()
      )
      fireEvent.click(screen.getByRole('button', { name: 'Change Video' }))
      fireEvent.click(screen.getByText('title1'))
      await waitFor(() => expect(getVideoResult).toHaveBeenCalled())
      fireEvent.click(screen.getAllByRole('button', { name: 'Select' })[0])
      await waitFor(() => expect(updateResult).toHaveBeenCalled())
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(undoResult).toHaveBeenCalled())
      fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
      await waitFor(() => expect(redoResult).toHaveBeenCalled())
    })

    it('deletes video cover block when video removed', async () => {
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
            getExistingCoverVideoMock,
            getVariantLanguagesMock,
            getVariantLanguagesMock,
            coverBlockDeleteMock,
            coverBlockRestoreMock,
            coverBlockDeleteMock
          ]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <ThemeProvider>
              <SnackbarProvider>
                <EditorProvider
                  initialState={{ selectedAttributeId: video.id }}
                >
                  <CommandProvider>
                    <BackgroundMediaVideo cardBlock={existingCoverBlock} />
                    <CommandUndoItem variant="button" />
                    <CommandRedoItem variant="button" />
                  </CommandProvider>
                </EditorProvider>
              </SnackbarProvider>
            </ThemeProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        fireEvent.click(
          screen.getByRole('button', { name: '#FallingPlates #FallingPlates' })
        )
      )
      fireEvent.click(screen.getByRole('button', { name: 'clear-video' }))
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
  })
})
