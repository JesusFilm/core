import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../../__generated__/BlockFields'
import {
  TypographyAlign,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { Drawer } from '../../../../Drawer'

import { Step } from '.'

const Demo: Meta<typeof Step> = {
  ...simpleComponentConfig,
  component: Step,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Step'
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

const Template: StoryObj<typeof Step> = {
  render: () => {
    const block: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      nextBlockId: null,
      parentOrder: 0,
      locked: false,
      children: [card(0)]
    }

    const block2: TreeBlock<StepBlock> = {
      id: 'step2.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      nextBlockId: null,
      parentOrder: 0,
      locked: false,
      children: [card(1)]
    }

    return (
      <EditorProvider initialState={{ steps: [block, block2] }}>
        <Drawer title="Step Properties">
          <Step {...block} />
        </Drawer>
      </EditorProvider>
    )
  }
}

export const Default = {
  ...Template,
  play: async () => {
    const StepAccordion = await screen.getByTestId('AccordionSummary')
    await userEvent.click(StepAccordion)
  }
}

const LockedTemplate: StoryObj<typeof Step> = {
  render: () => {
    const block: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      nextBlockId: null,
      parentOrder: 0,
      locked: true,
      children: [card(0)]
    }

    const block2: TreeBlock<StepBlock> = {
      id: 'step2.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      nextBlockId: null,
      parentOrder: 0,
      locked: false,
      children: [card(1)]
    }

    return (
      <EditorProvider initialState={{ steps: [block, block2] }}>
        <Drawer title="Step Properties">
          <Step {...block} />
        </Drawer>
      </EditorProvider>
    )
  }
}

export const Locked = {
  ...LockedTemplate,
  play: async () => {
    const StepAccordion = await screen.getByTestId('AccordionSummary')
    await userEvent.click(StepAccordion)
  }
}

export default Demo
