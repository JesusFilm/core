import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'
import { fn } from 'storybook/test'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { BlockFields_MultiselectBlock as MultiselectBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Drawer } from '../../../../Drawer'

import { Multiselect } from '.'

const Demo: Meta<typeof Multiselect> = {
  ...simpleComponentConfig,
  component: Multiselect,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Multiselect'
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
  ComponentProps<typeof Multiselect> & {
    block: TreeBlock<MultiselectBlock>
  }
> = {
  render: ({ block }) => {
    return (
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock: { ...block } }}>
          <Drawer title="Multiselect Properties" onClose={onClose}>
            <Multiselect {...block} />
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
