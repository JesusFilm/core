import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_FormBlock as FormBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import {
  GetFormBlock,
  GetFormBlockVariables
} from '../../../../../../../../../../__generated__/GetFormBlock'

import { GET_FORM_BLOCK } from './Credentials'

import { Credentials } from '.'

const CredentialsDemo: Meta<typeof Credentials> = {
  ...simpleComponentConfig,
  component: Credentials,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Form/Credentials'
}

const formBlock: TreeBlock<FormBlock> = {
  id: 'formBlock.id',
  __typename: 'FormBlock',
  parentBlockId: 'step0.id',
  parentOrder: 0,
  form: null,
  action: null,
  children: []
}

const getDefaultFormBlockMock: MockedResponse<
  GetFormBlock,
  GetFormBlockVariables
> = {
  request: {
    query: GET_FORM_BLOCK,
    variables: {
      id: formBlock.id
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

const Template: StoryObj = {
  render: () => (
    <MockedProvider mocks={[getDefaultFormBlockMock]}>
      <EditorProvider initialState={{ selectedBlock: { ...formBlock } }}>
        <Credentials />
      </EditorProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template
}

export default CredentialsDemo
