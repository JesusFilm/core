import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { StoryObj } from '@storybook/react'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import {
  StepAndCardBlockCreate,
  StepAndCardBlockCreateVariables
} from '../../../../../../../__generated__/StepAndCardBlockCreate'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { STEP_AND_CARD_BLOCK_CREATE } from '../../../../../../libs/useStepAndCardBlockCreateMutation/useStepAndCardBlockCreateMutation'

import { AddBlock } from './AddBlock'

const AddBlockStory = {
  ...simpleComponentConfig,
  component: AddBlock,
  title: 'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/AddBlock'
}

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

const Template: StoryObj<typeof AddBlock> = {
  render: () => (
    <MockedProvider mocks={[stepAndCardBlockCreateMock]}>
      <FlagsProvider flags={{ formiumForm: true }}>
        <Box sx={{ width: 328 }}>
          <AddBlock />
        </Box>
      </FlagsProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template
}

export default AddBlockStory
