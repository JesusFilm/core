import { Meta, Story } from '@storybook/react'
import noop from 'lodash/noop'

import { ActiveFab, EditorProvider } from '@core/journeys/ui/EditorProvider'

import { simpleComponentConfig } from '../../../../libs/storybook'

import { Fab } from '.'

const FabStory = {
  ...simpleComponentConfig,
  component: Fab,
  title: 'Journeys-Admin/Editor/ControlPanel/Fab'
}

const Template: Story = ({ ...args }) => {
  return (
    <EditorProvider initialState={{ ...args }}>
      <Fab visible onAddClick={noop} />
    </EditorProvider>
  )
}

export const Add = Template.bind({})
Add.args = {
  activeFab: ActiveFab.Add
}

export const Edit = Template.bind({})
Edit.args = {
  activeFab: ActiveFab.Edit
}

export const Save = Template.bind({})
Save.args = {
  activeFab: ActiveFab.Save
}

export default FabStory as Meta
