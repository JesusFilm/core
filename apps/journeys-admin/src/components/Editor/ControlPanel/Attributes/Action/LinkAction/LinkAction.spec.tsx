import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { EditorProvider } from '@core/journeys/ui'
import { steps } from '../data'
import { LinkAction, LINK_ACTION_UPDATE } from './LinkAction'

describe('LinkAction', () => {
  const selectedBlock = steps[1].children[0].children[3]
  it('defaults to place holder text', () => {
    const { getByPlaceholderText } = render(
      <MockedProvider>
        <LinkAction />
      </MockedProvider>
    )
    expect(getByPlaceholderText('Paste URL here...')).toBeInTheDocument()
  })

  it('shows the link on the action', async () => {
    const { getByDisplayValue } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <LinkAction />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByDisplayValue('https://www.google.com')).toBeInTheDocument()
  })

  it('updates the link on the action', async () => {
    const result = jest.fn(() => ({
      data: {
        blockUpdateLinkAction: {
          id: 'journeyId',
          gtmEventName: 'gtmEventName',
          url: 'https://www.github.com'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: LINK_ACTION_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  url: 'https://www.github.com'
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <LinkAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'https://www.github.com' }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
