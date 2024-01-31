import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../../libs/storybook'

import { AddBlockToolbar } from '.'

const AddBlockToolbarStory: Meta<typeof AddBlockToolbar> = {
  ...journeysAdminConfig,
  component: AddBlockToolbar,
  title: 'Journeys-Admin/Editor/ControlPanel/AddBlockToolbar',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

export const Default: StoryObj<typeof AddBlockToolbar> = {
  render: () => {
    return (
      <MockedProvider mocks={[]}>
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider
            initialState={{
              selectedStep: {
                __typename: 'StepBlock',
                id: 'stepId',
                parentBlockId: null,
                parentOrder: 0,
                locked: true,
                nextBlockId: null,
                children: [
                  {
                    id: 'cardId',
                    __typename: 'CardBlock',
                    parentBlockId: 'stepId',
                    coverBlockId: null,
                    parentOrder: 0,
                    backgroundColor: null,
                    themeMode: null,
                    themeName: null,
                    fullscreen: false,
                    children: []
                  }
                ]
              }
            }}
          >
            <AddBlockToolbar />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export default AddBlockToolbarStory
