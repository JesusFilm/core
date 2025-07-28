import { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ComponentProps } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { BlockFields_RadioQuestionBlock as RadioQuestionBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Drawer } from '../../../../Drawer'

import { RadioQuestion } from '.'

const Demo: Meta<typeof RadioQuestion> = {
  ...simpleComponentConfig,
  component: RadioQuestion,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/RadioQuestion'
}

const onClose = fn()

const block: TreeBlock<RadioQuestionBlock> = {
  id: 'radioQuestion1.id',
  __typename: 'RadioQuestionBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  gridView: false,
  children: []
}

const Template: StoryObj<
  ComponentProps<typeof RadioQuestion> & {
    block: TreeBlock<RadioQuestionBlock>
  }
> = {
  render: (block) => {
    return (
      <EditorProvider initialState={{ selectedBlock: { ...block } }}>
        <Drawer title="Poll Block Selected" onClose={onClose}>
          <RadioQuestion {...block} />
        </Drawer>
      </EditorProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    block
  }
}

export default Demo
