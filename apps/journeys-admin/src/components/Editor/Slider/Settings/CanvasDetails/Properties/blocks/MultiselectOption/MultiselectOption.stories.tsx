import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'
import { fn } from 'storybook/test'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { BlockFields_MultiselectOptionBlock as MultiselectOptionBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Drawer } from '../../../../Drawer'

import { MultiselectOption } from '.'

const Demo: Meta<typeof MultiselectOption> = {
  ...simpleComponentConfig,
  component: MultiselectOption,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/MultiselectOption'
}

const onClose = fn()

const block: TreeBlock<MultiselectOptionBlock> = {
  id: 'multiselectOption1.id',
  __typename: 'MultiselectOptionBlock',
  parentBlockId: 'multiselect1.id',
  parentOrder: 0,
  label: 'Option 1',
  children: []
}

const Template: StoryObj<
  ComponentProps<typeof MultiselectOption> & {
    block: TreeBlock<MultiselectOptionBlock>
  }
> = {
  render: (args) => {
    const { block } = args
    return (
      <EditorProvider initialState={{ selectedBlock: { ...block } }}>
        <Drawer title="Multiselect Option Properties" onClose={onClose}>
          <MultiselectOption {...block} />
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
