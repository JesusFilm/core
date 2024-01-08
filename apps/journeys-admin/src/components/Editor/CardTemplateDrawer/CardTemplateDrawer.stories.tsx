import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { journeysAdminConfig } from '../../../libs/storybook'
import { Drawer } from '../Drawer'

import { CardTemplateDrawer } from '.'

const CardTemplateDrawerStory: Meta<typeof CardTemplateDrawer> = {
  ...journeysAdminConfig,
  component: CardTemplateDrawer,
  title: 'Journeys-Admin/Editor/CardTemplateDrawer'
}

const Template: StoryObj<typeof CardTemplateDrawer> = {
  render: () => {
    return (
      <MockedProvider>
        <EditorProvider
          initialState={{
            drawerChildren: <CardTemplateDrawer />,
            drawerTitle: 'Card Templates',
            drawerMobileOpen: true
          }}
        >
          <Drawer />
        </EditorProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template
}

export default CardTemplateDrawerStory
