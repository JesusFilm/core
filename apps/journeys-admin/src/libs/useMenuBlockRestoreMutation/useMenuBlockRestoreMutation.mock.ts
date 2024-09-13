import { MockedResponse } from '@apollo/client/testing'

import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import {
  MenuBlockRestore,
  MenuBlockRestoreVariables
} from '../../../__generated__/MenuBlockRestore'
import { mockMenuStep } from '../../components/Editor/Slider/Settings/CanvasDetails/Footer/Menu/MenuActionButton/data'

import { MENU_BLOCK_RESTORE } from './useMenuBlockRestoreMutation'

export const mockUseMenuBlockRestoreMutation: MockedResponse<
  MenuBlockRestore,
  MenuBlockRestoreVariables
> = {
  request: {
    query: MENU_BLOCK_RESTORE,
    variables: {
      journeyId: defaultJourney.id,
      stepId: mockMenuStep.id,
      journeyUpdateInput: {
        menuStepBlockId: 'step.id'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      stepRestore: [mockMenuStep],
      journeyUpdate: {
        ...defaultJourney,
        menuStepBlock: mockMenuStep
      }
    }
  }))
}
