import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { Drawer } from '../../../../../Drawer'

import { BackgroundColor } from '.'

const BackgroundColorStory = {
  ...journeysAdminConfig,
  component: BackgroundColor,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Card/BackgroundColor',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const step = (block: TreeBlock): TreeBlock<StepBlock> => {
  return {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    children: [block],
    locked: false,
    nextBlockId: null
  }
}

const cardLight: TreeBlock<CardBlock> = {
  id: 'card1.id',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  fullscreen: false,
  children: []
}

export const Light: Story = () => {
  return (
    <MockedProvider>
      <EditorProvider
        initialState={{
          selectedStep: step(cardLight),
          drawerChildren: <BackgroundColor />,
          drawerTitle: 'Background Color Properties',
          drawerMobileOpen: true
        }}
      >
        <Drawer />
      </EditorProvider>
    </MockedProvider>
  )
}

const Template: Story = () => {
  const cardDark: TreeBlock<CardBlock> = {
    ...cardLight,
    backgroundColor: '#0277BD',
    themeName: ThemeName.base,
    themeMode: ThemeMode.dark
  }

  return (
    <MockedProvider>
      <EditorProvider
        initialState={{
          selectedStep: step(cardDark),
          drawerChildren: <BackgroundColor />,
          drawerTitle: 'Background Color Properties',
          drawerMobileOpen: true
        }}
      >
        <Drawer />
      </EditorProvider>
    </MockedProvider>
  )
}

export const Dark = Template.bind({})

export const MobileColorPicker = Template.bind({})
MobileColorPicker.parameters = {
  chromatic: {
    viewports: [360]
  }
}
MobileColorPicker.play = async () => {
  const customTab = await screen.getByRole('tab', { name: 'Custom' })
  await userEvent.click(customTab)
}

export default BackgroundColorStory as Meta
