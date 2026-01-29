import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { ReactionOption } from '.'

const ReactionOptionStory: Meta<typeof ReactionOption> = {
  ...simpleComponentConfig,
  component: ReactionOption,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Reactions/ReactionOption'
}

type Story = StoryObj<typeof ReactionOption>

const Template: Story = {
  render: (props) => (
    <MockedProvider>
      <ReactionOption {...props} />
    </MockedProvider>
  )
}

export const Default: Story = {
  ...Template,
  args: {
    title: 'Default',
    active: true,
    field: 'showShareButton',
    handleToggle: noop
  }
}

export const Empty: Story = {
  ...Template,
  args: {
    title: 'Empty',
    active: false,
    field: 'showShareButton',
    handleToggle: noop
  }
}

export default ReactionOptionStory
