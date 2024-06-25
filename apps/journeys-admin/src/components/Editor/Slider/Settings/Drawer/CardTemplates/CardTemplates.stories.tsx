import { MockedProvider } from '@apollo/client/testing'
import type { Meta, StoryObj } from '@storybook/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { journeysAdminConfig } from '../../../../../../libs/storybook'
import { Drawer } from '../Drawer'

import { expect } from '@storybook/jest'
import { screen } from '@storybook/testing-library'
import { CardTemplates } from '.'

const CardTemplatesStory: Meta<typeof CardTemplates> = {
  ...journeysAdminConfig,
  component: CardTemplates,
  title: 'Journeys-Admin/Editor/Slider/Settings/Drawer/CardTemplates'
}

const Template: StoryObj<typeof CardTemplates> = {
  render: ({ ...args }) => {
    return (
      <MockedProvider>
        <EditorProvider>
          <Drawer title="Card Templates">
            <CardTemplates {...args} />
          </Drawer>
        </EditorProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template
}

export const Loading = {
  ...Template,
  args: {
    loading: true
  },
  play: async () => {
    await expect(
      screen.queryAllByTestId('card-template-skeleton')
    ).toHaveLength(6)
  }
}

export default CardTemplatesStory
