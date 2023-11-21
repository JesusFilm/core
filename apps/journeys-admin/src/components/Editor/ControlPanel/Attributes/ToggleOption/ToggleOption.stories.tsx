import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import { simpleComponentConfig } from '../../../../../libs/storybook'
import { SidePanel } from '../../../../NewPageWrapper/SidePanel'
import { SidePanelContainer } from '../../../../NewPageWrapper/SidePanelContainer'

import { ToggleOptionProps } from './ToggleOption'

import { ToggleOption } from '.'

const ToggleOptionStory: Meta<typeof ToggleOption> = {
  ...simpleComponentConfig,
  component: ToggleOption,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/ToggleOption'
}

const Template: StoryObj<typeof ToggleOption> = {
  render: ({ ...args }: ToggleOptionProps) => {
    return (
      <SidePanel title="Title">
        <SidePanelContainer border={false}>
          <ToggleOption {...args} />
        </SidePanelContainer>
      </SidePanel>
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
