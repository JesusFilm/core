import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import {
  StepAndCardBlockCreate,
  StepAndCardBlockCreateVariables
} from '../../../../../../../__generated__/StepAndCardBlockCreate'
import { STEP_AND_CARD_BLOCK_CREATE } from '../../../../../../libs/useStepAndCardBlockCreateMutation/useStepAndCardBlockCreateMutation'

import { AddNewBlock } from './AddNewBlock'

describe('AddNewBlock', () => {
  const stepAndCardBlockCreateMock: MockedResponse<
    StepAndCardBlockCreate,
    StepAndCardBlockCreateVariables
  > = {
    request: {
      query: STEP_AND_CARD_BLOCK_CREATE,
      variables: {
        stepBlockCreateInput: {
          id: 'stepId',
          journeyId: 'journeyId'
        },
        cardBlockCreateInput: {
          id: 'cardId',
          journeyId: 'journeyId',
          parentBlockId: 'stepId',
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base
        }
      }
    },
    result: {
      data: {
        stepBlockCreate: {
          id: 'stepId',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          __typename: 'StepBlock'
        },
        cardBlockCreate: {
          id: 'cardId',
          parentBlockId: 'stepId',
          parentOrder: 0,
          backgroundColor: null,
          coverBlockId: null,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          __typename: 'CardBlock'
        }
      }
    }
  }

  it('renders add blocks toolbar properly', () => {
    const { getByTestId } = render(
      <MockedProvider mocks={[stepAndCardBlockCreateMock]}>
        <FlagsProvider flags={{ formiumForm: true }}>
          <AddNewBlock />
        </FlagsProvider>
      </MockedProvider>
    )

    expect(getByTestId('NewTypographyButton')).toBeInTheDocument()
    expect(getByTestId('NewImageButton')).toBeInTheDocument()
    expect(getByTestId('NewVideoButton')).toBeInTheDocument()
    expect(getByTestId('NewRadioQuestionButton')).toBeInTheDocument()
    expect(getByTestId('NewRadioQuestionButton')).toBeInTheDocument()
    expect(getByTestId('NewSignUpButton')).toBeInTheDocument()
    expect(getByTestId('NewButtonButton')).toBeInTheDocument()
    expect(getByTestId('NewFormButton')).toBeInTheDocument()
  })
})
