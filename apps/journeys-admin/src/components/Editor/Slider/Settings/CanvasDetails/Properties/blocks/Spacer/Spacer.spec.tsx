import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_SpacerBlock as SpacerBlock } from '../../../../../../../../../__generated__/BlockFields'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'
import { ThemeProvider } from '../../../../../../../ThemeProvider'

import { Spacer } from './Spacer'

describe('Spacer', () => {
  const defaultBlock: TreeBlock<SpacerBlock> = {
    __typename: 'SpacerBlock',
    id: 'spacerBlock.id',
    parentBlockId: null,
    parentOrder: null,
    spacing: 100,
    children: []
  }

  it('should show default attributes', () => {
    const { getByText } = render(
      <MockedProvider>
        <EditorProvider>
          <Spacer {...defaultBlock} />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByText('Spacer Height')).toBeInTheDocument()
    expect(getByText('100 Pixels')).toBeInTheDocument()
  })

  it('should have accordion open', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider>
            <Spacer {...defaultBlock} />
            <TestEditorState />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      getByText('selectedAttributeId: spacerBlock.id-spacer-options')
    ).toBeInTheDocument()
  })

  it('should update height when a different spacer is selected', () => {
    const { getByText, rerender } = render(
      <MockedProvider>
        <EditorProvider>
          <Spacer {...defaultBlock} spacing={100} />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByText('100 Pixels')).toBeInTheDocument()

    rerender(
      <MockedProvider>
        <EditorProvider>
          <Spacer {...defaultBlock} id="spacerBlock2.id" spacing={300} />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByText('300 Pixels')).toBeInTheDocument()
  })
})
