import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent } from '@testing-library/react'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../__generated__/GetJourney'
import { Action } from '.'

describe('Action', () => {
  it('shows Next Step by default', () => {
    const { getByText } = render(
      <MockedProvider>
        <Action />
      </MockedProvider>
    )
    expect(getByText('Next Step')).toBeInTheDocument()
  })

  it('shows properties for current action', () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'button',
      parentBlockId: 'card1.id',
      parentOrder: 3,
      label: 'Watch Now',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIcon: null,
      endIcon: null,
      action: {
        __typename: 'LinkAction',
        gtmEventName: 'gtmEventName',
        url: 'https://www.google.com'
      },
      children: []
    }

    const { getByText } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Action />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByText('URL/Website')).toBeInTheDocument()
  })

  it('shows properties for new action selected', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <Action />
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('button', { name: 'Next Step' }))
    fireEvent.mouseDown(getByRole('option', { name: 'Another Journey' }))
    expect(getByText('Another Journey')).toBeInTheDocument()
  })
})
