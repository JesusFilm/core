import { MockedResponse } from '@apollo/client/testing'

import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import {
  ThemeMode,
  ThemeName,
  TypographyVariant
} from '../../../../../../../../../../__generated__/globalTypes'
import {
  MenuBlockCreate,
  MenuBlockCreateVariables
} from '../../../../../../../../../../__generated__/MenuBlockCreate'
import { MENU_BLOCK_X, MENU_BLOCK_Y } from '../../constants'
import { menuCard, menuStep, menuTypography } from '../data'

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
        id: menuStep.id,
        journeyId: defaultJourney.id,
        x: MENU_BLOCK_X,
        y: MENU_BLOCK_Y
      },
      cardBlockCreateInput: {
        id: menuCard.id,
        journeyId: defaultJourney.id,
        parentBlockId: menuStep.id,
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base
      },
      typographyBlockCreateInput: {
        id: menuTypography.id,
        journeyId: defaultJourney.id,
        parentBlockId: menuCard.id,
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
      step: menuStep,
      card: menuCard,
      typography: menuTypography,
      journeyUpdate: {
        ...defaultJourney,
        menuStepBlock: menuStep
      }
    }
  }))
}
