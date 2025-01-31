import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

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
    minRows: null,
    integrationId: null,
    type: null,
    routeId: null,
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
    integrationId: null,
    type: null,
    routeId: null,
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
      getByRole('button', { name: 'Text Input default label' })
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
})
