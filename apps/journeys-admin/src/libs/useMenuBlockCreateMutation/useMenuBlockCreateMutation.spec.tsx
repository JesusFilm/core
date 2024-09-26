import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { ThemeMode } from '@core/shared/ui/themes'

import {
  ThemeName,
  TypographyVariant
} from '../../../__generated__/globalTypes'
import {
  MENU_BLOCK_X,
  MENU_BLOCK_Y
} from '../../components/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Menu/constants'

import { useMenuBlockCreateMutation } from './useMenuBlockCreateMutation'
import { mockUseMenuBlockCreateMutation } from './useMenuBlockCreateMutation.mock'

describe('useMenuBlockCreateMutation', () => {
  const input = {
    variables: {
      journeyId: defaultJourney.id,
      stepBlockCreateInput: {
        id: 'step.id',
        journeyId: defaultJourney.id,
        x: MENU_BLOCK_X,
        y: MENU_BLOCK_Y
      },
      cardBlockCreateInput: {
        id: 'card.id',
        journeyId: defaultJourney.id,
        parentBlockId: 'step.id',
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base
      },
      typographyBlockCreateInput: {
        id: 'typography.id',
        journeyId: defaultJourney.id,
        parentBlockId: 'card.id',
        content: 'Menu',
        variant: TypographyVariant.h1
      },
      journeyUpdateInput: {
        menuStepBlockId: 'step.id'
      }
    }
  }

  it('should create menu', async () => {
    const { result } = renderHook(() => useMenuBlockCreateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[mockUseMenuBlockCreateMutation]}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider>{children}</EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0](input)

      expect(mockUseMenuBlockCreateMutation.result).toHaveBeenCalled()
    })
  })

  it('should update cache', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey-id': {
        blocks: [],
        id: 'journey-id',
        __typename: 'Journey'
      }
    })

    const { result } = renderHook(() => useMenuBlockCreateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[mockUseMenuBlockCreateMutation]} cache={cache}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider>{children}</EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0](input)

      await waitFor(() =>
        expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([
          { __ref: 'StepBlock:step.id' },
          { __ref: 'CardBlock:card.id' },
          { __ref: 'TypographyBlock:typography.id' }
        ])
      )
    })
  })
})
