import { MockedResponse } from '@apollo/client/testing'

import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import {
  ThemeMode,
  ThemeName,
  TypographyVariant
} from '../../../__generated__/globalTypes'
import {
  MenuBlockCreate,
  MenuBlockCreateVariables
} from '../../../__generated__/MenuBlockCreate'
import {
  MENU_BLOCK_X,
  MENU_BLOCK_Y
} from '../../components/Editor/Slider/Settings/CanvasDetails/Footer/Menu/constants'
import {
  mockMenuCard,
  mockMenuStep,
  mockMenuTypography
} from '../../components/Editor/Slider/Settings/CanvasDetails/Footer/Menu/MenuActionButton/data'

import { MENU_BLOCK_CREATE } from './useMenuBlockCreateMutation'

export const mockUseMenuBlockCreateMutation: MockedResponse<
  MenuBlockCreate,
  MenuBlockCreateVariables
> = {
  request: {
    query: MENU_BLOCK_CREATE,
    variables: {
      journeyId: defaultJourney.id,
      stepBlockCreateInput: {
        id: mockMenuStep.id,
        journeyId: defaultJourney.id,
        x: MENU_BLOCK_X,
        y: MENU_BLOCK_Y
      },
      cardBlockCreateInput: {
        id: mockMenuCard.id,
        journeyId: defaultJourney.id,
        parentBlockId: mockMenuStep.id,
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base
      },
      typographyBlockCreateInput: {
        id: mockMenuTypography.id,
        journeyId: defaultJourney.id,
        parentBlockId: mockMenuCard.id,
        content: 'Menu',
        variant: TypographyVariant.h1
      },
      journeyUpdateInput: {
        menuStepBlockId: 'step.id'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      step: mockMenuStep,
      card: mockMenuCard,
      typography: mockMenuTypography,
      journeyUpdate: {
        ...defaultJourney,
        menuStepBlock: mockMenuStep
      }
    }
  }))
}
