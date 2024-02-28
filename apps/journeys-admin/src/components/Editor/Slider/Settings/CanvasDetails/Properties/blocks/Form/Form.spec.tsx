import { MockedProvider } from '@apollo/client/testing'
import { Form as FormiumFormType } from '@formium/types'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider/EditorProvider'

import {
  BlockFields_FormBlock_action as FormAction,
  BlockFields_FormBlock as FormBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'

import { Form } from '.'

describe('Form', () => {
  const block: TreeBlock<FormBlock> = {
    id: 'formBlock.id',
    __typename: 'FormBlock',
    parentBlockId: 'step0.id',
    parentOrder: 0,
    form: null,
    action: null,
    children: []
  }

  it('should show default values', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <Form {...block} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Credentials Incomplete' })
    ).toBeInTheDocument()
  })

  it('should show filled values', () => {
    const action: FormAction = {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'formBlock.id',
      gtmEventName: 'navigateToBlock',
      blockId: 'step1.id'
    }

    const filledBlock = {
      ...block,
      form: {
        id: 'formiumForm.id',
        name: 'form name'
      } as unknown as FormiumFormType,
      action
    }

    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <Form {...filledBlock} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(
      getByRole('button', { name: 'Action Selected Card' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Credentials Complete' })
    ).toBeInTheDocument()
  })

  it('action accordion should be open', () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider>
            <Form {...block} />
            <TestEditorState />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(
      getByText('selectedAttributeId: formBlock.id-form-action')
    ).toBeInTheDocument()
  })

  it('should open credentials accordion when clicked', () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider>
            <Form {...block} />
            <TestEditorState />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByText('Credentials'))
    expect(
      getByText('selectedAttributeId: formBlock.id-form-credentials')
    ).toBeInTheDocument()
  })
})
