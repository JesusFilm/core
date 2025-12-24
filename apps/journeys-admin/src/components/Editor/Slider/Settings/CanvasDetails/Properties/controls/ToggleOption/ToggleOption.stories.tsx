import { MockedProvider } from '@apollo/client/testing'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'
import { ComponentPropsWithoutRef } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { ToggleOption } from '.'

const ToggleOptionStory: Meta<typeof ToggleOption> = {
  ...simpleComponentConfig,
  component: ToggleOption,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/controls/ToggleOption'
}

const Template: StoryObj<ComponentPropsWithoutRef<typeof ToggleOption>> = {
  render: (args) => {
    return (
      <MockedProvider>
        <EditorProvider>
          <ToggleOption {...args} />
        </EditorProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    heading: 'Toggle Heading',
    checked: false,
    handleChange: noop
  }
}

export const Filled = {
  ...Template,
  args: {
    heading: 'Toggle Heading',
    description: 'Toggle Description',
    checked: true,
    handleChange: noop,
    children: <Typography variant="caption">Children</Typography>
  }
}

export default ToggleOptionStory
