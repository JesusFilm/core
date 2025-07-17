import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'

import { DragDropWrapper } from '.'

describe('DragDropWrapper', () => {
  const block: TreeBlock = {
    __typename: 'ButtonBlock',
    id: 'button',
    parentBlockId: 'question',
    parentOrder: 0,
    label: 'This is a Button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    submitEnabled: null,
    action: null,
    children: [],
    settings: null
  }

  it('should render children', async () => {
    const children = <BlockRenderer block={block} />

    render(
      <MockedProvider>
        <DragDropWrapper>{children}</DragDropWrapper>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByText('This is a Button')).toBeInTheDocument()
    )
  })
})
