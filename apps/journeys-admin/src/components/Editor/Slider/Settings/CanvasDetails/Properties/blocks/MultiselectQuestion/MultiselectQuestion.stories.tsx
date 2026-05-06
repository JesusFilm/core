import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'
import { fn } from 'storybook/test'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { BlockFields_MultiselectBlock as MultiselectBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Drawer } from '../../../../Drawer'

import { MultiselectQuestion } from '.'

const Demo: Meta<typeof MultiselectQuestion> = {
  ...simpleComponentConfig,
  component: MultiselectQuestion,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/MultiselectQuestion'
}

const onClose = fn()

const block: TreeBlock<MultiselectBlock> = {
  id: 'multiselect1.id',
  __typename: 'MultiselectBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  min: 0,
  max: 2,
  children: [
    {
      __typename: 'MultiselectOptionBlock',
      id: 'option1.id',
      parentBlockId: 'multiselect1.id',
      parentOrder: 0,
      label: 'Option 1',
      children: []
    },
    {
      __typename: 'MultiselectOptionBlock',
      id: 'option2.id',
      parentBlockId: 'multiselect1.id',
      parentOrder: 1,
      label: 'Option 2',
      children: []
    }
  ]
}

const Template: StoryObj<
  ComponentProps<typeof MultiselectQuestion> & {
    block: TreeBlock<MultiselectBlock>
  }
> = {
  render: ({ block }) => {
    return (
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock: { ...block } }}>
          <Drawer title="Multiselect Properties" onClose={onClose}>
            <MultiselectQuestion {...block} />
          </Drawer>
        </EditorProvider>
      </MockedProvider>
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
