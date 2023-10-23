import { MockedProvider } from '@apollo/client/testing'
import { expect } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../libs/storybook'

import { Menu } from '.'

const MenuStory: Meta<typeof Menu> = {
  ...journeysAdminConfig,
  component: Menu,
  title: 'Journeys-Admin/Editor/EditToolbar/Menu'
}

const Template: StoryObj<typeof Menu> = {
  render: ({ ...args }) => {
    return (
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              status: JourneyStatus.draft,
              tags: []
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ ...args }}>
            <Menu />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export const Block = {
  ...Template,
  args: {
    selectedBlock: {
      id: 'typography0.id',
      __typename: 'TypographyBlock',
      parentBlockId: 'card1.id',
      parentOrder: 0,
      content: 'Title',
      variant: null,
      color: null,
      align: null,
      children: []
    }
  },
  play: async () => {
    const menuButton = screen.getByRole('button')
    await userEvent.click(menuButton)
  }
}

export const Card = {
  ...Template,
  args: {
    selectedBlock: {
      __typename: 'StepBlock',
      id: 'stepId',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: true,
      nextBlockId: null,
      children: []
    }
  },
  play: async () => {
    const menuButton = screen.getByRole('button')
    await userEvent.click(menuButton)
  }
}

export const DeleteCardDialog = {
  ...Template,
  args: {
    selectedBlock: {
      __typename: 'StepBlock',
      id: 'stepId',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: true,
      nextBlockId: null,
      children: []
    }
  },
  play: async () => {
    await userEvent.click(screen.getByRole('button'))
    await waitFor(async () => {
      await expect(
        screen.getByRole('menuitem', { name: 'Delete Card' })
      ).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete Card' }))
  }
}

export default MenuStory
