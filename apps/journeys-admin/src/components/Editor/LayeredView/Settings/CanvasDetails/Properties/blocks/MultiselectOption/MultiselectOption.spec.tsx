import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_MultiselectOptionBlock as MultiselectOptionBlock } from '../../../../../../../../../__generated__/BlockFields'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'
import { ThemeProvider } from '../../../../../../../ThemeProvider'

import { MultiselectOption } from '.'

describe('MultiselectOption Properties', () => {
  const block: TreeBlock<MultiselectOptionBlock> = {
    id: 'multiselectOption1.id',
    __typename: 'MultiselectOptionBlock',
    parentBlockId: 'multiselect1.id',
    parentOrder: 0,
    label: 'Option 1',
    children: []
  }

  it('renders instruction text', async () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <EditorProvider>
              <MultiselectOption {...block} />
            </EditorProvider>
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        getByText('Edit the option label directly on the canvas.')
      ).toBeInTheDocument()
    )
  })

  it('sets selectedAttributeId for option', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider>
            <MultiselectOption {...block} />
            <TestEditorState />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(
      getByText('selectedAttributeId: multiselectOption1.id-multiselect-option')
    ).toBeInTheDocument()
  })
})
