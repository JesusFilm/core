import { MockedResponse } from '@apollo/client/testing'

import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import {
  MenuBlockDelete,
  MenuBlockDeleteVariables
} from '../../../__generated__/MenuBlockDelete'
import { mockMenuStep } from '../../components/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Menu/MenuActionButton/data'

import { MENU_BLOCK_DELETE } from './useMenuBlockDeleteMutation'

export const mockUseMenuBlockDeleteMutation: MockedResponse<
  MenuBlockDelete,
  MenuBlockDeleteVariables
> = {
  request: {
    query: MENU_BLOCK_DELETE,
    variables: {
      journeyId: defaultJourney.id,
      stepId: mockMenuStep.id,
      journeyUpdateInput: {
        menuStepBlockId: null
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      stepDelete: [],
      journeyUpdate: {
        ...defaultJourney,
        menuStepBlock: null
      }
    }
  }))
}
