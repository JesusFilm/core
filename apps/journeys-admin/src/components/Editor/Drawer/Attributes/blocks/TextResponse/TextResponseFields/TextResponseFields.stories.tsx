import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'

import { TextResponseFields } from '.'

const TextResponseStory: Meta<typeof TextResponseFields> = {
  ...journeysAdminConfig,
  component: TextResponseFields,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/TextResponse/TextResponseFields'
}

const Template: StoryObj<typeof TextResponseFields> = {
  render: ({ ...args }) => {
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
}

export const Default = {
  ...Template,
  args: {
    block: {
      label: 'Your answer here'
    }
  }
}

export const Complete = {
  ...Template,
  args: {
    block: {
      label: 'Label limit 1234',
      hint: 'Hint limit 12345678910',
      minRows: 4
    }
  }
}

export const Loading = { ...Template }

export default TextResponseStory
