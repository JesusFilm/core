import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import {
  JourneyProvider,
  RenderLocation
} from '@core/journeys/ui/JourneyProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
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
          renderLocation: RenderLocation.Admin
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
