import { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ComponentProps } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { BlockFields_RadioOptionBlock as RadioOptionBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Drawer } from '../../../../Drawer'

import { RadioOption } from '.'

const Demo: Meta<typeof RadioOption> = {
  ...simpleComponentConfig,
  component: RadioOption,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/RadioOption'
}

const onClose = fn()

const block: TreeBlock<RadioOptionBlock> = {
  id: 'radioOption1.id',
  __typename: 'RadioOptionBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  label: 'Radio Option',
  action: null,
  pollOptionImageId: null,
  children: []
}

const Template: StoryObj<
  ComponentProps<typeof RadioOption> & { block: TreeBlock<RadioOptionBlock> }
> = {
  render: (block) => {
    return (
      <EditorProvider initialState={{ selectedBlock: { ...block } }}>
        <Drawer title="Poll Option Properties" onClose={onClose}>
          <RadioOption {...block} />
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

export const Filled = {
  ...Template,
  args: {
    ...block,
    action: {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'radioOption1.id',
      gtmEventName: 'navigateToBlock',
      blockId: 'step2.id'
    }
  }
}

export default Demo
