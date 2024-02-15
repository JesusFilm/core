import { StoryObj } from '@storybook/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import {
  ActiveFab,
  ActiveSlide
} from '@core/journeys/ui/EditorProvider/EditorProvider'

import { simpleComponentConfig } from '../../../libs/storybook'

import { Fab } from './Fab'

const FabStory = {
  ...simpleComponentConfig,
  component: Fab,
  title: 'Journeys-Admin/Editor/Fab'
}

const Template: StoryObj<typeof Fab> = {
  render: ({ ...args }) => (
    <EditorProvider
      initialState={{
        activeSlide: ActiveSlide.Content,
        activeFab: args.activeFab
      }}
    >
      <Fab />
    </EditorProvider>
  )
}

export const Default = {
  ...Template,
  args: { activeFab: ActiveFab.Add }
}

export const Edit = {
  ...Template,
  args: { activeFab: ActiveFab.Edit }
}

export const Save = {
  ...Template,
  args: { activeFab: ActiveFab.Save }
}

export default FabStory
