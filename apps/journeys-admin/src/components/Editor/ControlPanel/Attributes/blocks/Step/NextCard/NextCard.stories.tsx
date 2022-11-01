import { Story, Meta } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { MockedProvider } from '@apollo/client/testing'
import { Drawer } from '../../../../../Drawer'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import {
  ThemeName,
  ThemeMode,
  TypographyVariant,
  TypographyAlign
} from '../../../../../../../../__generated__/globalTypes'
import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../__generated__/GetJourney'
import { NextCard } from '.'

const NextCardStory = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Step/NextCard',
  component: NextCard
}

const card = (index: number): TreeBlock<CardBlock> => {
  return {
    id: `card${index}.id`,
    __typename: 'CardBlock',
    parentBlockId: `step${index}.id`,
    parentOrder: 0,
    backgroundColor: '#DDDDDD',
    coverBlockId: null,
    fullscreen: false,
    themeMode: null,
    themeName: null,
    children: [
      {
        id: `typography${index}.id`,
        __typename: 'TypographyBlock',
        parentBlockId: `card${index}.id`,
        parentOrder: 0,
        align: TypographyAlign.center,
        color: null,
        content: `Card ${index + 1}`,
        variant: TypographyVariant.h1,
        children: []
      }
    ]
  }
}

const block0: TreeBlock<StepBlock> = {
  id: 'step0.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  nextBlockId: 'step2.id',
  parentOrder: 0,
  locked: true,
  children: [card(0)]
}

const block1: TreeBlock<StepBlock> = {
  id: 'step1.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  nextBlockId: null,
  parentOrder: 0,
  locked: false,
  children: [card(1)]
}

const block2: TreeBlock<StepBlock> = {
  id: 'step2.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  nextBlockId: 'step3.id',
  parentOrder: 0,
  locked: true,
  children: [card(2)]
}

const block3: TreeBlock<StepBlock> = {
  id: 'step3.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  nextBlockId: 'step4.id',
  parentOrder: 0,
  locked: true,
  children: [card(3)]
}

const journeyTheme = {
  id: 'journeyId',
  themeMode: ThemeMode.light,
  themeName: ThemeName.base,
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng'
  }
} as unknown as Journey

const Template: Story = ({ ...args }) => {
  return (
    <MockedProvider>
      <JourneyProvider value={{ journey: journeyTheme, admin: true }}>
        <EditorProvider
          initialState={{
            ...args,
            steps: [block0, block1, block2, block3],
            drawerTitle: 'Next Card Properties',
            drawerChildren: <NextCard />,
            drawerMobileOpen: true
          }}
        >
          <Drawer />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  selectedBlock: block1
}

// TODO: Hide VR only story from sidebar
// https://github.com/storybookjs/storybook/issues/9209
export const DefaultMobileConditions = Template.bind({})
DefaultMobileConditions.args = {
  selectedBlock: block1
}

DefaultMobileConditions.parameters = {
  chromatic: {
    viewports: [360]
  }
}
DefaultMobileConditions.play = async () => {
  const conditionsTab = await screen.getByRole('tab', { name: 'Conditions' })
  await userEvent.click(conditionsTab)
}

export const Selected = Template.bind({})
Selected.args = {
  selectedBlock: block0
}

export const SelectedMobileConditions = Template.bind({})
SelectedMobileConditions.args = {
  selectedBlock: block0
}

SelectedMobileConditions.parameters = {
  chromatic: {
    viewports: [360]
  }
}

SelectedMobileConditions.play = async () => {
  const conditionsTab = await screen.getByRole('tab', { name: 'Conditions' })
  await userEvent.click(conditionsTab)
}

export default NextCardStory as Meta
