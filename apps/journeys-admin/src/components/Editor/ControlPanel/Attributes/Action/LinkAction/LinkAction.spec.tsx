import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { EditorProvider } from '@core/journeys/ui'
import { InMemoryCache } from '@apollo/client'
import { steps } from '../data'
import { LinkAction, LINK_ACTION_UPDATE } from './LinkAction'

describe('LinkAction', () => {
  const selectedBlock = steps[1].children[0].children[3]
  it('defaults to place holder text', () => {
    const { getByLabelText } = render(
      <MockedProvider>
        <LinkAction />
      </MockedProvider>
    )
    expect(getByLabelText('Paste URL here...')).toBeInTheDocument()
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
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'ButtonBlock:button1.id' }],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'ButtonBlock:button1.id': {
        ...selectedBlock
      }
    })

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
        cache={cache}
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

    expect(cache.extract()['ButtonBlock:button1.id']?.action).toEqual({
      gtmEventName: 'gtmEventName',
      url: 'https://www.github.com'
    })
  })

  it('is a required field', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <EditorProvider>
          <LinkAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: '' }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(getByText('Required')).toBeInTheDocument())
  })

  it('validates the input as a URL', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <EditorProvider>
          <LinkAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'www.incorectUrl.com/needs-protocol' }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(getByText('Invalid URL')).toBeInTheDocument())
  })
})
