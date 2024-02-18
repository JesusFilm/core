import { StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import {
  ActiveContent,
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

const Template: StoryObj<
  ComponentProps<typeof Fab> & { activeFab: ActiveFab }
> = {
  render: ({ activeFab, ...args }) => {
    return (
      <EditorProvider
        initialState={{
          activeSlide: ActiveSlide.Content,
          activeContent: ActiveContent.Canvas,
          activeFab
        }}
      >
        <Fab variant={args.variant} />
      </EditorProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: { activeFab: ActiveFab.Add, variant: 'canvas' }
}

export const Edit = {
  ...Template,
  args: { activeFab: ActiveFab.Edit, variant: 'canvas' }
}

export const Mobile = {
  ...Template,
  args: {
    activeFab: ActiveFab.Add,
    variant: 'mobile'
  }
}

export const MobileEdit = {
  ...Template,
  args: { activeFab: ActiveFab.Edit, variant: 'mobile' }
}

export default FabStory
