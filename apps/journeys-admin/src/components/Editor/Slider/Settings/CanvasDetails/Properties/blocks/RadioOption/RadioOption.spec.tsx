import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_RadioQuestionBlock as RadioQuestionBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'
import { ThemeProvider } from '../../../../../../../ThemeProvider'

import { RadioOption } from '.'

describe('RadioOption Attribute', () => {
  const block: TreeBlock<RadioOptionBlock> = {
    id: 'radioOption1.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    label: 'Radio Option',
    action: null,
    pollOptionImageBlockId: null,
    children: []
  }

  it('shows default attributes', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <RadioOption {...block} />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    )
  })

  it('shows filled attributes', async () => {
    const radioOptionBlock: TreeBlock<RadioOptionBlock> = {
      ...block,
      action: {
        __typename: 'NavigateToBlockAction',
        parentBlockId: 'radioOption1.id',
        gtmEventName: 'navigateToBlock',
        blockId: 'step2.id'
      }
    }
    const { getByRole } = render(
      <MockedProvider>
        <RadioOption {...radioOptionBlock} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        getByRole('button', { name: 'Action Selected Card' })
      ).toBeInTheDocument()
    )
  })

  it('action accordion should be open', async () => {
    const radioOptionBlock: TreeBlock<RadioOptionBlock> = {
      ...block,
      action: {
        __typename: 'NavigateToBlockAction',
        parentBlockId: 'radioOption1.id',
        gtmEventName: 'navigateToBlock',
        blockId: 'step2.id'
      }
    }
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider>
            <RadioOption {...radioOptionBlock} />
            <TestEditorState />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      getByText('selectedAttributeId: radioOption1.id-radio-option-action')
    ).toBeInTheDocument()
  })

  it('should disable image accordion when radio question block gridView is false', async () => {
    const parentBlock: TreeBlock<RadioQuestionBlock> = {
      id: 'step1.id',
      __typename: 'RadioQuestionBlock',
      parentBlockId: 'step0.id',
      parentOrder: 0,
      gridView: false,
      children: []
    }

    const radioOptionBlock: TreeBlock<RadioOptionBlock> = {
      ...block,
      parentBlockId: 'step1.id'
    }

    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider
            initialState={{
              selectedBlock: radioOptionBlock,
              selectedStep: {
                id: 'step0.id',
                __typename: 'StepBlock',
                parentBlockId: 'journey1.id',
                parentOrder: 0,
                children: [parentBlock],
                locked: false,
                nextBlockId: null,
                slug: null
              }
            }}
          >
            <RadioOption {...radioOptionBlock} />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      const imageAccordion = getByRole('button', {
        name: 'Image Source No image'
      })
      expect(imageAccordion).toBeDisabled()
    })
  })

  it('should enable image accordion when radio question block gridView is true', async () => {
    const parentBlock: TreeBlock<RadioQuestionBlock> = {
      id: 'step1.id',
      __typename: 'RadioQuestionBlock',
      parentBlockId: 'step0.id',
      parentOrder: 0,
      gridView: true,
      children: []
    }

    const radioOptionBlock: TreeBlock<RadioOptionBlock> = {
      ...block,
      parentBlockId: 'step1.id'
    }

    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider
            initialState={{
              selectedBlock: radioOptionBlock,
              selectedStep: {
                id: 'step0.id',
                __typename: 'StepBlock',
                parentBlockId: 'journey1.id',
                parentOrder: 0,
                children: [parentBlock],
                locked: false,
                nextBlockId: null,
                slug: null
              }
            }}
          >
            <RadioOption {...radioOptionBlock} />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      const imageAccordion = getByRole('button', {
        name: 'Image Source No image'
      })
      expect(imageAccordion).not.toBeDisabled()
    })
  })
})
