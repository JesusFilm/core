import { MockedResponse } from '@apollo/client/testing'

import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import {
  StepAndCardBlockCreate,
  StepAndCardBlockCreateVariables
} from '../../../__generated__/StepAndCardBlockCreate'

import { STEP_AND_CARD_BLOCK_CREATE } from './useStepAndCardBlockCreateMutation'

export const stepAndCardBlockCreateMock: MockedResponse<
  StepAndCardBlockCreate,
  StepAndCardBlockCreateVariables
> = {
  request: {
    query: STEP_AND_CARD_BLOCK_CREATE,
    variables: {
      stepBlockCreateInput: {
        id: 'newStep.id',
        journeyId: 'journey-id',
        x: -200,
        y: 38
      },
      cardBlockCreateInput: {
        id: 'newCard.id',
        journeyId: 'journey-id',
        parentBlockId: 'newStep.id',
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base
      }
    }
  },
  result: {
    data: {
      stepBlockCreate: {
        __typename: 'StepBlock',
        id: 'newStep.id',
        parentBlockId: null,
        parentOrder: null,
        locked: false,
        nextBlockId: null,
        x: -200,
        y: 38,
        slug: null
      },
      cardBlockCreate: {
        __typename: 'CardBlock',
        id: 'newCard.id',
        parentBlockId: 'newStep.id',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        fullscreen: false,
        backdropBlur: null
      }
    }
  }
}
