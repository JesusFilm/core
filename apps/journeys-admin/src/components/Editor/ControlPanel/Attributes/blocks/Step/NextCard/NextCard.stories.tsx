import { Story, Meta } from '@storybook/react'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'
import { Drawer } from '../../../../../Drawer'
import { JourneyProvider } from '../../../../../../../libs/context'
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

const selectedBlock: TreeBlock<StepBlock> = {
  id: 'step0.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  nextBlockId: 'step1.id',
  parentOrder: 0,
  locked: true,
  children: [card(0)]
}

const noSelectedBlock: TreeBlock<StepBlock> = {
  id: 'step1.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  nextBlockId: null,
  parentOrder: 0,
  locked: false,
  children: [card(1)]
}

const journeyTheme = {
  id: 'journeyId',
  themeMode: ThemeMode.light,
  themeName: ThemeName.base
} as unknown as Journey

const Template: Story = ({ ...args }) => {
  return (
    <MockedProvider>
      <JourneyProvider value={journeyTheme}>
        <EditorProvider
          initialState={{
            ...args,
            steps: [selectedBlock, noSelectedBlock],
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
  selectedBlock: noSelectedBlock
}

export const Selected = Template.bind({})
Selected.args = {
  selectedBlock: selectedBlock
}

export default NextCardStory as Meta
