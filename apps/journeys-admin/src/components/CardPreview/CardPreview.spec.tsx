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
import { STEP_AND_CARD_BLOCK_CREATE } from './CardPreview'
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
})
