import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { TreeBlock, blockHistoryVar, treeBlocksVar } from '../../../libs/block'
import { BlockFields_StepBlock as StepBlock } from '../../../libs/block/__generated__/BlockFields'
import { journeyUiConfig } from '../../../libs/journeyUiConfig'

import { PaginationBullets } from './PaginationBullets'

const Demo: Meta<typeof PaginationBullets> = {
  ...journeyUiConfig,
  component: PaginationBullets,
  title: 'Journeys-Ui/StepHeader/PaginationBullets'
}

const step1: TreeBlock<StepBlock> = {
  id: 'step1.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: 'step2.id',
  slug: null,
  children: []
}
const step2: TreeBlock<StepBlock> = {
  id: 'step2.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 1,
  locked: false,
  nextBlockId: 'step3.id',
  slug: null,
  children: []
}
const step3: TreeBlock<StepBlock> = {
  id: 'step3.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 2,
  locked: false,
  nextBlockId: 'step4.id',
  slug: null,
  children: []
}
const step4: TreeBlock<StepBlock> = {
  id: 'step4.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 3,
  locked: false,
  nextBlockId: 'step5.id',
  slug: null,
  children: []
}
const step5: TreeBlock<StepBlock> = {
  id: 'step5.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 4,
  locked: false,
  nextBlockId: null,
  slug: null,
  children: []
}

type Story = StoryObj<
  ComponentProps<typeof PaginationBullets> & {
    blocks: TreeBlock[]
    blockHistory: TreeBlock[]
  }
>
const Template: Story = {
  render: ({ blocks, blockHistory }) => {
    treeBlocksVar(blocks)
    blockHistoryVar(blockHistory)
    return (
      <ThemeProvider
        themeName={ThemeName.journeyUi}
        themeMode={ThemeMode.light}
      >
        <PaginationBullets />
      </ThemeProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: { blocks: [step1, step2, step3, step4, step5], blockHistory: [step1] }
}

export const Second = {
  ...Template,
  args: {
    blocks: [step1, step2, step3, step4, step5],
    blockHistory: [step1, step2]
  }
}

export const Middle = {
  ...Template,
  args: {
    blocks: [step1, step2, step3, step4, step5],
    blockHistory: [step1, step2, step3]
  }
}
export const SecondToLast = {
  ...Template,
  args: {
    blocks: [step1, step2, step3, step4, step5],
    blockHistory: [step1, step2, step3, step4]
  }
}

export const Last = {
  ...Template,
  args: {
    blocks: [step1, step2, step3, step4, step5],
    blockHistory: [step1, step2, step3, step4, step5]
  }
}

export default Demo
