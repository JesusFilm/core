import { Story, Meta } from '@storybook/react'
import { journeyAdminConfig } from '../../../../libs/storybook'
import { Navigation } from '.'
import { useState } from 'react'
import {
  GetJourneyForEdit_journey_blocks as Block,
  GetJourneyForEdit_journey_blocks_StepBlock as StepBlock
} from '../../../../../__generated__/GetJourneyForEdit'
import { TreeBlock } from '../../../../../../../libs/shared/ui/src/libs/transformer/transformer'

const NavigationStory = {
  ...journeyAdminConfig,
  component: Navigation,
  title: 'JourneyAdmin/Editor/ControlPanel/Navigation'
}

const Template: Story = () => {
  const [selectedStep, setSelectedStep] =
    useState<TreeBlock<StepBlock, Block>>()
  return (
    <Navigation
      onSelect={(step) => setSelectedStep(step)}
      selectedStep={selectedStep}
      steps={[
        {
          __typename: 'StepBlock',
          locked: false,
          nextBlockId: null,
          id: 'stepBlock1',
          parentBlockId: null,
          children: [
            {
              __typename: 'CardBlock',
              id: 'cardBlock1',
              parentBlockId: null,
              backgroundColor: '#000',
              coverBlockId: null,
              themeMode: null,
              themeName: null,
              fullscreen: false,
              children: []
            }
          ]
        },
        {
          __typename: 'StepBlock',
          locked: false,
          nextBlockId: null,
          id: 'stepBlock2',
          parentBlockId: null,
          children: [
            {
              __typename: 'CardBlock',
              id: 'cardBlock2',
              parentBlockId: null,
              backgroundColor: '#000',
              coverBlockId: null,
              themeMode: null,
              themeName: null,
              fullscreen: false,
              children: []
            }
          ]
        }
      ]}
    />
  )
}

export const Default = Template.bind({})

export default NavigationStory as Meta
