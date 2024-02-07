import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { ComponentProps } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName,
  TypographyAlign,
  TypographyVariant
} from '../../../../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { Drawer } from '../../../../../Drawer'

import { NextCard } from '.'

const NextCardStory: Meta<typeof NextCard> = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Step/NextCard',
  component: NextCard,
  // do not remove these parameters for this story, see: https://github.com/storybookjs/storybook/issues/17025
  parameters: {
    docs: {
      source: { type: 'code' }
    }
  }
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

type Story = StoryObj<
  ComponentProps<typeof NextCard> & { selectedBlock: TreeBlock<StepBlock> }
>

const Template: Story = {
  render: ({ ...args }) => {
    return (
      <MockedProvider>
        <JourneyProvider value={{ journey: journeyTheme, variant: 'admin' }}>
          <EditorProvider
            initialState={{
              ...args,
              steps: [block0, block1, block2, block3],
              drawerTitle: 'Next Card Properties',
              drawerMobileOpen: true,
              drawerChildren: <NextCard />
            }}
          >
            <Drawer />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    selectedBlock: block1
  }
}

// TODO: Hide VR only story from sidebar
// https://github.com/storybookjs/storybook/issues/9209
export const DefaultMobileConditions = {
  ...Template,
  args: {
    selectedBlock: block1
  },
  parameters: {
    chromatic: {
      viewports: [360]
    }
  },
  play: async () => {
    const conditionsTab = await screen.getByRole('tab', { name: 'Conditions' })
    await userEvent.click(conditionsTab)
  }
}

export const Selected = {
  ...Template,
  args: {
    selectedBlock: block0
  }
}

export const SelectedMobileConditions = {
  ...Template,
  args: {
    selectedBlock: block0
  },
  parameters: {
    chromatic: {
      viewports: [360]
    }
  },
  play: async () => {
    const conditionsTab = await screen.getByRole('tab', { name: 'Conditions' })
    await userEvent.click(conditionsTab)
  }
}

export default NextCardStory
