import { MockedResponse } from '@apollo/client/testing'

import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import {
  MenuBlockCreate,
  MenuBlockCreateVariables
} from '../../../__generated__/MenuBlockCreate'
import {
  MENU_BLOCK_X,
  MENU_BLOCK_Y
} from '../../components/Editor/Slider/Settings/CanvasDetails/Footer/Menu/constants'
import {
  mockMenuButton1,
  mockMenuButton2,
  mockMenuButton3,
  mockMenuCard,
  mockMenuHeading,
  mockMenuStep,
  mockMenuSubHeading
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
      stepInput: {
        id: mockMenuStep.id,
        journeyId: defaultJourney.id,
        x: MENU_BLOCK_X,
        y: MENU_BLOCK_Y
      },
      cardInput: {
        id: mockMenuCard.id,
        journeyId: defaultJourney.id,
        parentBlockId: mockMenuStep.id,
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base
      },
      headingInput: {
        id: mockMenuHeading.id,
        journeyId: defaultJourney.id,
        parentBlockId: mockMenuCard.id,
        content: mockMenuHeading.content,
        variant: mockMenuHeading.variant,
        align: mockMenuHeading.align
      },
      subHeadingInput: {
        id: mockMenuSubHeading.id,
        journeyId: defaultJourney.id,
        parentBlockId: mockMenuCard.id,
        content: mockMenuSubHeading.content,
        variant: mockMenuSubHeading.variant,
        align: mockMenuSubHeading.align
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
  },
  result: jest.fn(() => ({
    data: {
      step: mockMenuStep,
      card: mockMenuCard,
      heading: mockMenuHeading,
      subHeading: mockMenuSubHeading,
      button1: mockMenuButton1,
      button2: mockMenuButton2,
      button3: mockMenuButton3,
      journeyUpdate: {
        ...defaultJourney,
        menuStepBlock: mockMenuStep
      }
    }
  }))
}
