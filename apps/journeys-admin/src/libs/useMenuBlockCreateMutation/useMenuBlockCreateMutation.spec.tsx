import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { ThemeMode } from '@core/shared/ui/themes'

import {
  ThemeName,
  TypographyAlign,
  TypographyVariant
} from '../../../__generated__/globalTypes'
import {
  MENU_BLOCK_X,
  MENU_BLOCK_Y
} from '../../components/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Menu/constants'
import {
  mockMenuButton1,
  mockMenuButton2,
  mockMenuButton3
} from '../../components/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Menu/MenuActionButton/data'

import { useMenuBlockCreateMutation } from './useMenuBlockCreateMutation'
import { mockUseMenuBlockCreateMutation } from './useMenuBlockCreateMutation.mock'

describe('useMenuBlockCreateMutation', () => {
  const input = {
    variables: {
      journeyId: defaultJourney.id,
      stepInput: {
        id: 'step.id',
        journeyId: defaultJourney.id,
        x: MENU_BLOCK_X,
        y: MENU_BLOCK_Y
      },
      cardInput: {
        id: 'card.id',
        journeyId: defaultJourney.id,
        parentBlockId: 'step.id',
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base
      },
      headingInput: {
        id: 'heading.id',
        journeyId: defaultJourney.id,
        parentBlockId: 'card.id',
        content: 'Menu',
        variant: TypographyVariant.h1,
        align: TypographyAlign.center
      },
      subHeadingInput: {
        id: 'subHeading.id',
        journeyId: defaultJourney.id,
        parentBlockId: 'card.id',
        content: 'Helping people discover Jesus.',
        variant: TypographyVariant.subtitle2,
        align: TypographyAlign.center
      },
      button1Input: {
        id: mockMenuButton1.id,
        journeyId: defaultJourney.id,
        parentBlockId: mockMenuButton1.parentBlockId,
        label: mockMenuButton1.label,
        size: mockMenuButton1.size,
        variant: mockMenuButton1.buttonVariant
      },
      button2Input: {
        id: mockMenuButton2.id,
        journeyId: defaultJourney.id,
        parentBlockId: mockMenuButton2.parentBlockId,
        label: mockMenuButton2.label,
        size: mockMenuButton2.size,
        variant: mockMenuButton2.buttonVariant
      },
      button3Input: {
        id: mockMenuButton3.id,
        journeyId: defaultJourney.id,
        parentBlockId: mockMenuButton3.parentBlockId,
        label: mockMenuButton3.label,
        size: mockMenuButton3.size,
        variant: mockMenuButton3.buttonVariant
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
          { __ref: 'TypographyBlock:heading.id' },
          { __ref: 'TypographyBlock:subHeading.id' },
          { __ref: 'ButtonBlock:button1.id' },
          { __ref: 'ButtonBlock:button2.id' },
          { __ref: 'ButtonBlock:button3.id' }
        ])
      )
    })
  })
})
