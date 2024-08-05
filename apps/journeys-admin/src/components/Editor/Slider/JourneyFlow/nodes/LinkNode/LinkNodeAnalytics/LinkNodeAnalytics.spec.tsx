import { render, screen } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ButtonBlock } from '../../../../../../../../__generated__/BlockFields'

import { LinkNodeAnalytics } from '.'

describe('LinkNodeAnalytics', () => {
  it('should render with count', () => {
    const block = {
      __typename: 'ButtonBlock',
      id: 'button.id',
      label: 'button',
      action: {
        __typename: 'LinkAction',
        parentBlockId: 'button.id',
        url: 'https://example.com',
        gtmEventName: null
      },
      children: []
    } as unknown as TreeBlock<BlockFields_ButtonBlock>

    const targetMap = new Map([['button.id->link:https://example.com', 10]])

    const initialState = {
      analytics: {
        targetMap
      }
    } as unknown as EditorState

    render(
      <EditorProvider initialState={initialState}>
        <LinkNodeAnalytics actionBlock={block} />
      </EditorProvider>
    )

    const icon = screen.getByTestId('Cursor4Icon')
    const clickCount = screen.getByText('10')

    expect(icon).toBeInTheDocument()
    expect(clickCount).toBeInTheDocument()
  })

  it('should render default value', () => {
    render(<LinkNodeAnalytics />)

    // should show the tilde
    const clickCount = screen.getByText('~')
    expect(clickCount).toBeInTheDocument()
  })
})
