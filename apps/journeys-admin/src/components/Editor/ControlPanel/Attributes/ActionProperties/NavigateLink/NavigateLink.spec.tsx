import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import { NavigateLink, NAVIGATE_TO_LINK_ACTION_UPDATE } from './NavigateLink'

describe('NavigateLink', () => {
  it('defaults to place holder text', () => {
    const { getByPlaceholderText } = render(
      <MockedProvider>
        <NavigateLink />
      </MockedProvider>
    )
    expect(getByPlaceholderText('Paste URL here...')).toBeInTheDocument()
  })

  it('shows the link on the action', async () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'journeyId',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
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
    const { getByDisplayValue } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <NavigateLink />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByDisplayValue('https://www.google.com')).toBeInTheDocument()
  })

  it('updates the link on the action', async () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'journeyId',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIcon: null,
      endIcon: null,
      action: null,
      children: []
    }

    const result = jest.fn(() => ({
      data: {
        blockUpdateLinkAction: {
          id: 'journeyId',
          action: {
            url: 'https://www.google.com'
          }
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: NAVIGATE_TO_LINK_ACTION_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  url: 'https://www.google.com'
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <NavigateLink />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'https://www.google.com' }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
