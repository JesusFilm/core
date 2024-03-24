import { Form as FormType } from '@formium/types'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_FormBlock as FormBlock } from '../../../../../../../../../__generated__/BlockFields'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { Drawer } from '../../../../Drawer'

import { Form } from '.'

const Demo: Meta<typeof Form> = {
  ...simpleComponentConfig,
  component: Form,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Form'
}

const Template: StoryObj<ComponentProps<typeof Form>> = {
  render: ({ ...args }) => (
    <EditorProvider initialState={{ selectedBlock: filledFormBlock }}>
      <Drawer title="Form Properties">
        <Form {...args} />
      </Drawer>
    </EditorProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    id: 'id',
    form: null,
    action: null
  }
}

const filledFormBlock: TreeBlock<FormBlock> = {
  id: 'formBlock.id',
  __typename: 'FormBlock',
  parentBlockId: 'step0.id',
  parentOrder: 0,
  form: {
    id: 'formiumForm.id',
    name: 'form name'
  } as unknown as FormType,
  action: {
    __typename: 'NavigateToBlockAction',
    parentBlockId: 'formBlock.id',
    gtmEventName: 'navigateToBlock',
    blockId: 'step1.id'
  },
  children: []
}

export const Filled = {
  ...Template,
  args: {
    // id: 'id',
    // form: {
    //   id: 'form.id',
    //   name: 'form name'
    // } as unknown as FormType,
    // action: {
    //   __typename: 'NavigateToBlockAction',
    //   parentBlockId: 'button1.id',
    //   gtmEventName: 'navigateToBlock',
    //   blockId: 'step2.id'
    // }
    ...filledFormBlock
  }
}

export default Demo
