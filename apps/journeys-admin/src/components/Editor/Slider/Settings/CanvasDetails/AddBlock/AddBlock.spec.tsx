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
import { ThemeProvider } from '../../../../../ThemeProvider'

import { AddBlock } from './AddBlock'

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
        <ThemeProvider>
          <FlagsProvider flags={{ formiumForm: true }}>
            <AddBlock />
          </FlagsProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(
      getByTestId('JourneysAdminButtonNewTypographyButton')
    ).toBeInTheDocument()
    expect(getByTestId('JourneysAdminButtonNewImageButton')).toBeInTheDocument()
    expect(getByTestId('JourneysAdminButtonNewVideoButton')).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewRadioQuestionButton')
    ).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewRadioQuestionButton')
    ).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewSignUpButton')
    ).toBeInTheDocument()
    expect(getByTestId('JourneysAdminButtonNewButton')).toBeInTheDocument()
    expect(
      getByTestId('JourneysAdminButtonNewFormiumFormIcon')
    ).toBeInTheDocument()
  })

  it('does not render FormiumForm button when flag is falsh', () => {
    const { queryByTestId } = render(
      <MockedProvider mocks={[stepAndCardBlockCreateMock]}>
        <ThemeProvider>
          <FlagsProvider flags={{ formiumForm: false }}>
            <AddBlock />
          </FlagsProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      queryByTestId('JourneysAdminButtonNewFormiumFormIcon')
    ).not.toBeInTheDocument()
  })
})
