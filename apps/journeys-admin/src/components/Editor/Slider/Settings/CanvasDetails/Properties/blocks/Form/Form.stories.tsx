import { MockedResponse } from '@apollo/client/testing'
import { Form as FormType } from '@formium/types'
import { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ComponentProps } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { BlockFields_FormBlock as FormBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  GetFormBlock,
  GetFormBlockVariables
} from '../../../../../../../../../__generated__/GetFormBlock'
import { Drawer } from '../../../../Drawer'

import { GET_FORM_BLOCK } from './Credentials/Credentials'

import { Form } from '.'

const Demo: Meta<typeof Form> = {
  ...simpleComponentConfig,
  component: Form,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Form'
}

const onClose = fn()

const formBlock: TreeBlock<FormBlock> = {
  id: 'formBlock.id',
  __typename: 'FormBlock',
  parentBlockId: 'step0.id',
  parentOrder: 0,
  form: null,
  action: null,
  children: []
}

const filledFormBlock: TreeBlock<FormBlock> = {
  ...formBlock,
  form: {
    id: 'formiumForm.id',
    name: 'form name'
  } as unknown as FormType,
  action: {
    __typename: 'NavigateToBlockAction',
    parentBlockId: 'formBlock.id',
    gtmEventName: 'navigateToBlock',
    blockId: 'step1.id'
  }
}

const getDefaultFormBlockMock: MockedResponse<
  GetFormBlock,
  GetFormBlockVariables
> = {
  request: {
    query: GET_FORM_BLOCK,
    variables: {
      id: filledFormBlock.id
    }
  },
  result: {
    data: {
      block: {
        id: 'formBlock.id',
        __typename: 'FormBlock',
        projects: [],
        projectId: null,
        formSlug: null,
        forms: [],
        apiTokenExists: false
      }
    }
  }
}

const getFilledFormBlockMock: MockedResponse<
  GetFormBlock,
  GetFormBlockVariables
> = {
  request: {
    query: GET_FORM_BLOCK,
    variables: {
      id: filledFormBlock.id
    }
  },
  result: {
    data: {
      block: {
        id: 'formBlock.id',
        __typename: 'FormBlock',
        projects: [
          {
            __typename: 'FormiumProject',
            id: 'projectId',
            name: 'project name'
          }
        ],
        projectId: 'projectId',
        formSlug: 'FilledFormSlug',
        forms: [
          {
            __typename: 'FormiumForm',
            slug: 'FilledFormSlug',
            name: 'Filled Form Name'
          }
        ],
        apiTokenExists: true
      }
    }
  }
}

const Template: StoryObj<ComponentProps<typeof Form>> = {
  render: (block) => (
    <EditorProvider initialState={{ selectedBlock: { ...block } }}>
      <Drawer title="Form Properties" onClose={onClose}>
        <Form {...block} />
      </Drawer>
    </EditorProvider>
  )
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [getDefaultFormBlockMock]
    }
  },
  args: {
    ...formBlock
  }
}

export const Filled = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [getFilledFormBlockMock]
    }
  },
  args: {
    ...filledFormBlock
  }
}

export default Demo
