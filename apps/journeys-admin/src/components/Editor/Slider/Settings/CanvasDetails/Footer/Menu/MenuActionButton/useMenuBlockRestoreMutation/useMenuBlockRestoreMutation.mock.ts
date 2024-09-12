import { MockedResponse } from '@apollo/client/testing'

import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import {
  MenuBlockRestore,
  MenuBlockRestoreVariables
} from '../../../../../../../../../../__generated__/MenuBlockRestore'
import { menuStep } from '../data'

import { MENU_BLOCK_RESTORE } from './useMenuBlockRestoreMutation'

export const mockUseMenuBlockRestoreMutation: MockedResponse<
  MenuBlockRestore,
  MenuBlockRestoreVariables
> = {
  request: {
    query: MENU_BLOCK_RESTORE,
    variables: {
      journeyId: defaultJourney.id,
      stepId: menuStep.id,
      journeyUpdateInput: {
        menuStepBlockId: 'step.id'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      stepRestore: [menuStep],
      journeyUpdate: {
        ...defaultJourney,
        menuStepBlock: menuStep
      }
    }
  }))
}
