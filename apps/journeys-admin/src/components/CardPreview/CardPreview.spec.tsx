import { render, fireEvent, waitFor } from '@testing-library/react'
import { TreeBlock, JourneyProvider } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'
import { v4 as uuidv4 } from 'uuid'
import { InMemoryCache } from '@apollo/client'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../__generated__/GetJourney'
import { ThemeName, ThemeMode } from '../../../__generated__/globalTypes'
import {
  STEP_AND_CARD_BLOCK_CREATE,
  STEP_BLOCK_NEXTBLOCKID_UPDATE,
  VIDEO_BLOCK_SET_DEFAULT_ACTION
} from './CardPreview'
import { CardPreview } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('CardPreview', () => {
  const mocks = [
    {
      request: {
        query: STEP_AND_CARD_BLOCK_CREATE,
        variables: {
          journeyId: 'journeyId',
          stepId: 'stepId',
          cardId: 'cardId'
        }
      },
      result: {
        data: {
          stepBlockCreate: {
            id: 'stepId',
            parentBlockId: null,
            parentOrder: 0,
            locked: false,
            nextBlockId: null,
            __typename: 'StepBlock'
          },
          cardBlockCreate: {
            id: 'cardId',
            parentBlockId: 'stepId',
            parentOrder: 0,
            backgroundColor: null,
            coverBlockId: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            __typename: 'CardBlock'
          }
        }
      }
    }
  ]

  it('should call onSelect when step is clicked', () => {
    const onSelect = jest.fn()
    const step: TreeBlock<StepBlock> = {
      id: 'step.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      children: []
    }
    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base
            } as unknown as Journey,
            admin: true
          }}
        >
          <CardPreview onSelect={onSelect} steps={[step]} />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('preview-step.id'))
    expect(onSelect).toHaveBeenCalledWith(step)
  })

  it('should create step and card when add button is clicked', async () => {
    mockUuidv4.mockReturnValueOnce('stepId')
    mockUuidv4.mockReturnValueOnce('cardId')
    const onSelect = jest.fn()

    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base
            } as unknown as Journey,
            admin: true
          }}
        >
          <CardPreview steps={[]} onSelect={onSelect} showAddButton />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith({
        __typename: 'StepBlock',
        children: [
          {
            __typename: 'CardBlock',
            backgroundColor: null,
            children: [],
            coverBlockId: null,
            fullscreen: false,
            id: 'cardId',
            parentBlockId: 'stepId',
            parentOrder: 0,
            themeMode: null,
            themeName: null
          }
        ],
        id: 'stepId',
        locked: false,
        nextBlockId: null,
        parentBlockId: null,
        parentOrder: 0
      })
    )
  })

  it('should create a new cache reference for the newly created card', async () => {
    mockUuidv4.mockReturnValueOnce('stepId')
    mockUuidv4.mockReturnValueOnce('cardId')
    const onSelect = jest.fn()

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })

    const { getByRole } = render(
      <MockedProvider cache={cache} mocks={mocks}>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base
            } as unknown as Journey,
            admin: true
          }}
        >
          <CardPreview steps={[]} onSelect={onSelect} showAddButton />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'StepBlock:stepId' },
        { __ref: 'CardBlock:cardId' }
      ])
    })
  })

  it('should not set last step nextBlockId, if it is already connected to a valid step, when a new card is created', async () => {
    mockUuidv4.mockReturnValueOnce('stepId')
    mockUuidv4.mockReturnValueOnce('cardId')

    const onSelect = jest.fn()

    const step: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      parentOrder: 0,
      parentBlockId: null,
      id: 'lastStepId',
      locked: false,
      nextBlockId: 'someStepId',
      children: []
    }

    const result = jest.fn(() => ({
      data: {
        stepBlockUpdate: {
          journeyId: 'journeyId',
          id: 'stepId',
          nextBlockId: 'nextBlockId'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          ...mocks,
          {
            request: {
              query: STEP_BLOCK_NEXTBLOCKID_UPDATE,
              variables: {
                id: 'lastStepId',
                journeyId: 'journeyId',
                input: {
                  nextBlockId: 'stepId'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base
            } as unknown as Journey,
            admin: true
          }}
        >
          <CardPreview steps={[step]} onSelect={onSelect} showAddButton />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('should set the action of the previous steps video block when a new card is created', async () => {
    mockUuidv4.mockReturnValueOnce('stepId')
    mockUuidv4.mockReturnValueOnce('cardId')
    const onSelect = jest.fn()

    const videoBlock: TreeBlock = {
      __typename: 'VideoBlock',
      id: 'videoId',
      parentBlockId: 'cardId',
      parentOrder: 0,
      autoplay: false,
      startAt: 10,
      endAt: null,
      muted: null,
      posterBlockId: 'posterBlockId',
      fullsize: null,
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
        }
      },
      children: []
    }

    const step: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'lastStepId',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: 'someStepId',
      children: [
        {
          id: 'cardId',
          __typename: 'CardBlock',
          parentBlockId: 'lastStepId.id',
          parentOrder: 0,
          coverBlockId: null,
          backgroundColor: null,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          children: [videoBlock]
        }
      ]
    }

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        id: 'journeyId',
        __typename: 'Journey'
      },
      'VideoBlock:videoId': {
        ...videoBlock
      }
    })

    const result = jest.fn(() => ({
      data: {
        blockUpdateNavigateToBlockAction: {
          id: videoBlock.id,
          journeyId: 'journeyId',
          gtmEventName: 'gtmEventName',
          blockId: 'stepId'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          ...mocks,
          {
            request: {
              query: STEP_BLOCK_NEXTBLOCKID_UPDATE,
              variables: {
                id: 'lastStepId',
                journeyId: 'journeyId',
                input: {
                  nextBlockId: 'stepId'
                }
              }
            },
            result: {
              data: {
                stepBlockUpdate: {
                  journeyId: 'journeyId',
                  id: 'stepId',
                  nextBlockId: 'nextBlockId'
                }
              }
            }
          },
          {
            request: {
              query: VIDEO_BLOCK_SET_DEFAULT_ACTION,
              variables: {
                id: videoBlock.id,
                journeyId: 'journeyId',
                input: {
                  blockId: 'stepId'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base
            } as unknown as Journey,
            admin: true
          }}
        >
          <CardPreview steps={[step]} onSelect={onSelect} showAddButton />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['VideoBlock:videoId']?.action).toEqual({
      gtmEventName: 'gtmEventName',
      blockId: 'stepId'
    })
  })
})
