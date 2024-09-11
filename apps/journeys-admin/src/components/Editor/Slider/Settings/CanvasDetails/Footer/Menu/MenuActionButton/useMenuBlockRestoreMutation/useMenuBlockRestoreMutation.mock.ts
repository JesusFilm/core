import { MockedResponse } from '@apollo/client/testing'

import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../../../__generated__/globalTypes'
import {
  MenuBlockRestore,
  MenuBlockRestoreVariables
} from '../../../../../../../../../../__generated__/MenuBlockRestore'
import { menuCard, menuStep, menuTypography } from '../data'

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
      cardId: menuCard.id,
      typographyId: menuTypography.id,
      journeyUpdateInput: {
        menuStepBlockId: 'step.id'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      stepRestore: [menuStep],
      cardRestore: [
        {
          __typename: 'CardBlock',
          id: 'card.id',
          parentBlockId: 'step.id',
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base,
          fullscreen: false,
          coverBlockId: null,
          backgroundColor: null,
          parentOrder: 0
        }
      ],
      typographyRestore: [menuTypography],
      journeyUpdate: {
        ...defaultJourney,
        menuStepBlock: menuStep
      }
    }
  }))
}
