import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../../libs/storybook'

import { BlocksTab } from '.'

const BlocksTabStory = {
  ...journeysAdminConfig,
  component: BlocksTab,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

export const Default: Story = () => {
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
          <BlocksTab />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default BlocksTabStory as Meta
