import { Meta, StoryObj } from '@storybook/nextjs'
import { fn } from 'storybook/test'
import { ComponentProps } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { BlockFields_SpacerBlock as SpacerBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Drawer } from '../../../../Drawer'

import { Spacer } from '.'

const Demo: Meta<typeof Spacer> = {
  ...simpleComponentConfig,
  component: Spacer,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Spacer'
}

const onClose = fn()

const block: TreeBlock<SpacerBlock> = {
  id: 'Spacer.id',
  __typename: 'SpacerBlock',
  parentBlockId: null,
  parentOrder: 0,
  spacing: 100,
  children: []
}

const Template: StoryObj<ComponentProps<typeof Spacer>> = {
  render: (args) => {
    return (
      <EditorProvider initialState={{ selectedBlock: { ...args } }}>
        <Drawer title="Spacer Properties" onClose={onClose}>
          <Spacer {...args} />
        </Drawer>
      </EditorProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    ...block
  }
}

export default Demo
