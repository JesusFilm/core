import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  IconColor,
  IconName,
  IconSize
} from '../../../../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'
import { ThemeProvider } from '../../../../../../../ThemeProvider'

import { TextResponse } from './TextResponse'

describe('TextResponse', () => {
  const defaultBlock: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponseBlock.id',
    parentBlockId: null,
    parentOrder: null,
    label: 'default label',
    hint: null,
    submitLabel: 'Submit',
    minRows: null,
    submitIconId: null,
    action: null,
    children: []
  }

  const completeBlock: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponseBlock.id',
    parentBlockId: null,
    parentOrder: null,
    label: 'complete label',
    hint: 'hint text',
    minRows: 2,
    submitLabel: 'Submit',
    submitIconId: 'icon.id',
    action: {
      __typename: 'LinkAction',
      parentBlockId: 'responseAction.id',
      gtmEventName: 'responseAction',
      url: 'https://www.google.com'
    },
    children: [
      {
        id: 'icon.id',
        __typename: 'IconBlock',
        parentBlockId: 'button',
        parentOrder: 0,
        iconName: IconName.ArrowForwardRounded,
        iconColor: IconColor.action,
        iconSize: IconSize.lg,
        children: []
      }
    ]
  }

  it('should show default attributes', () => {
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider>
          <TextResponse {...defaultBlock} />
        </EditorProvider>
      </MockedProvider>
    )

    expect(
      getByRole('button', { name: 'Feedback default label' })
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Icon None' })
    ).toBeInTheDocument()
  })

  it('should show filled attributes', () => {
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider>
          <TextResponse {...completeBlock} />{' '}
        </EditorProvider>
      </MockedProvider>
    )

    expect(
      getByRole('button', { name: 'Feedback complete label' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Action URL/Website' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Icon Arrow Right' })
    ).toBeInTheDocument()
  })

  it('should have feedback edit accordion open', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider>
            <TextResponse {...completeBlock} />
            <TestEditorState />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      getByText('selectedAttributeId: textResponseBlock.id-text-field-options')
    ).toBeInTheDocument()
  })

  it('should open button action edit', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider>
            <TextResponse {...completeBlock} />
            <TestEditorState />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Action URL/Website' }))
    expect(
      getByText('selectedAttributeId: textResponseBlock.id-text-field-action')
    ).toBeInTheDocument()
  })

  it('should open button icon edit', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider>
            <TextResponse {...completeBlock} />
            <TestEditorState />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Button Icon Arrow Right' }))
    expect(
      getByText('selectedAttributeId: textResponseBlock.id-text-field-icon')
    ).toBeInTheDocument()
  })
})
