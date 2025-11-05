import { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ComponentProps } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Drawer } from '../../../../Drawer'

import { TextResponse } from './TextResponse'

const Demo: Meta<typeof TextResponse> = {
  ...journeysAdminConfig,
  component: TextResponse,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/TextResponse',
  // do not remove these parameters for this story, see: https://github.com/storybookjs/storybook/issues/17025
  parameters: {
    docs: {
      source: { type: 'code' }
    }
  }
}

const onClose = fn()

const block: TreeBlock<TextResponseBlock> = {
  __typename: 'TextResponseBlock',
  id: 'textResponseBlock.id',
  parentBlockId: null,
  parentOrder: null,
  label: '',
  placeholder: null,
  hint: null,
  minRows: null,
  required: null,
  integrationId: null,
  type: null,
  routeId: null,
  children: []
}

const Template: StoryObj<ComponentProps<typeof TextResponse>> = {
  render: ({ ...args }) => {
    return (
      <EditorProvider initialState={{ selectedBlock: { ...args } }}>
        <Drawer title="Feedback Properties" onClose={onClose}>
          <TextResponse {...args} />
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

export const Complete = {
  ...Template,
  args: {
    ...block,
    __typename: 'TextResponseBlock',
    id: 'textResponseBlock.id',
    parentBlockId: null,
    parentOrder: null,
    label: 'complete label',
    placeholder: 'placeholder text',
    hint: 'hint text',
    minRows: 2,
    required: true,
    children: []
  }
}

export default Demo
