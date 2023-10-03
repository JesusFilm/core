import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { simpleComponentConfig } from '../../../libs/storybook'
import { Drawer } from '../Drawer'

import { CardLibrary } from '.'

const CardLibraryStory: Meta<typeof CardLibrary> = {
  ...simpleComponentConfig,
  component: CardLibrary,
  title: 'Journeys-Admin/Editor/CardLibrary'
}

const Template: StoryObj<typeof CardLibrary> = {
  render: () => {
    return (
      <MockedProvider>
        <EditorProvider
          initialState={{
            drawerChildren: <CardLibrary />,
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

export default CardLibraryStory
