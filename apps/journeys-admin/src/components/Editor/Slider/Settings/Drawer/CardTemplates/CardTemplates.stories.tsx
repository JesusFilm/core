import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { Drawer } from '../Drawer'

import { CardTemplates } from '.'

const CardTemplatesStory: Meta<typeof CardTemplates> = {
  ...journeysAdminConfig,
  component: CardTemplates,
  title: 'Journeys-Admin/Editor/Slider/Settings/Drawer/CardTemplates'
}

const Template: StoryObj<typeof CardTemplates> = {
  render: () => {
    return (
      <MockedProvider>
        <EditorProvider>
          <Drawer title="Card Templates">
            <CardTemplates />
          </Drawer>
        </EditorProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template
}

export default CardTemplatesStory
