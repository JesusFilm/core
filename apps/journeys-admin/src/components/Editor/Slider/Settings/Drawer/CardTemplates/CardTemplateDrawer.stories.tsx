import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { journeysAdminConfig } from '../../../../../../libs/storybook'
import { Drawer } from '../Drawer'

import { CardTemplateDrawer } from '.'

const CardTemplateDrawerStory: Meta<typeof CardTemplateDrawer> = {
  ...journeysAdminConfig,
  component: CardTemplateDrawer,
  title: 'Journeys-Admin/Editor/Slider/Settings/Drawer/CardTemplates'
}

const Template: StoryObj<typeof CardTemplateDrawer> = {
  render: () => {
    return (
      <MockedProvider>
        <EditorProvider>
          <Drawer>
            <CardTemplateDrawer />
          </Drawer>
        </EditorProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template
}

export default CardTemplateDrawerStory
