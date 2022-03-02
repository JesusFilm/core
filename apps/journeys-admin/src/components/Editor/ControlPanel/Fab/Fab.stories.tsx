import { noop } from 'lodash'
import { Story, Meta } from '@storybook/react'
import {
  ActiveFab,
  EditorProvider,
  simpleComponentConfig
} from '@core/journeys/ui'
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
