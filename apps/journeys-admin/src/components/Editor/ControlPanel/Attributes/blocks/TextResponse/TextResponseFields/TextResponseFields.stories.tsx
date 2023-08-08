import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'

import { TextResponseFields } from '.'

const TextResponseStory = {
  ...journeysAdminConfig,
  component: TextResponseFields,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/TextResponse/TextResponseFields'
}

const Template: Story = ({ ...args }) => {
  return (
    <MockedProvider>
      <JourneyProvider
        value={{
          journey: { id: 'journey.id' } as unknown as Journey,
          variant: 'admin'
        }}
      >
        <EditorProvider
          initialState={{
            selectedBlock: args.block
          }}
        >
          <TextResponseFields />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  block: {
    label: 'Your answer here'
  }
}

export const Complete = Template.bind({})
Complete.args = {
  block: {
    label: 'Label limit 1234',
    hint: 'Hint limit 12345678910',
    minRows: 4
  }
}

export const Loading = Template.bind({})

export default TextResponseStory as Meta
