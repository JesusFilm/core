import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'

import { ActiveFab, EditorProvider } from '@core/journeys/ui/EditorProvider'

import { simpleComponentConfig } from '../../../../libs/storybook'

import { Fab } from '.'

const FabStory: Meta<typeof Fab> = {
  ...simpleComponentConfig,
  component: Fab,
  title: 'Journeys-Admin/Editor/ControlPanel/Fab'
}

type Story = StoryObj<
  ComponentProps<typeof EditorProvider> & { activeFab: ActiveFab }
>

const Template: Story = {
  render: ({ ...args }) => {
    return (
      <EditorProvider initialState={{ ...args }}>
        <Fab visible onAddClick={noop} />
      </EditorProvider>
    )
  }
}

export const Add = {
  ...Template,
  args: {
    activeFab: ActiveFab.Add
  }
}

export const Edit = {
  ...Template,
  args: {
    activeFab: ActiveFab.Edit
  }
}

export const Save = {
  ...Template,
  args: {
    activeFab: ActiveFab.Save
  }
}

export default FabStory
