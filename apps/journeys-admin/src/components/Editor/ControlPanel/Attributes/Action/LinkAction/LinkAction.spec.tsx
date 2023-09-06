import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import { steps } from '../data'

import { LINK_ACTION_UPDATE, LinkAction } from './LinkAction'

describe('LinkAction', () => {
  const selectedBlock = steps[1].children[0].children[3]
  const result = jest.fn(() => ({
    data: {
      blockUpdateLinkAction: {
        id: selectedBlock.id,
        gtmEventName: 'gtmEventName',
        url: 'https://github.com'
      }
    }
  }))

  const mocks = [
    {
      request: {
        query: LINK_ACTION_UPDATE,
        variables: {
          id: selectedBlock.id,
          journeyId: 'journeyId',
          input: {
            url: 'https://github.com'
          }
        }
      },
      result
    }
  ]

  it('displays the action url', async () => {
    const { getByDisplayValue } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <LinkAction />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByDisplayValue('https://www.google.com')).toBeInTheDocument()
  })

  it('updates action url', async () => {
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

    const { getByRole } = render(
      <MockedProvider mocks={mocks} cache={cache}>
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedBlock }}>
            <LinkAction />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'https://github.com' }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(cache.extract()['ButtonBlock:button1.id']?.action).toEqual({
      gtmEventName: 'gtmEventName',
      url: 'https://github.com'
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
    fireEvent.change(getByRole('textbox', { name: 'Paste URL here...' }), {
      target: { value: '' }
    })
    fireEvent.blur(getByRole('textbox', { name: 'Paste URL here...' }))
    await waitFor(() => expect(getByText('Required')).toBeInTheDocument())
  })

  it('accepts links without protocol as a URL', async () => {
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

    const { queryByText, getByRole } = render(
      <MockedProvider mocks={mocks} cache={cache}>
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedBlock }}>
            <LinkAction />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'github.com' }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() =>
      expect(queryByText('Invalid URL')).not.toBeInTheDocument()
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() =>
      expect(cache.extract()['ButtonBlock:button1.id']?.action).toEqual({
        gtmEventName: 'gtmEventName',
        url: 'https://github.com'
      })
    )
  })

  it('accepts deep links as a URL', async () => {
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
          id: selectedBlock.id,
          gtmEventName: 'gtmEventName',
          url: 'viber://'
        }
      }
    }))

    const { queryByText, getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: LINK_ACTION_UPDATE,
              variables: {
                id: selectedBlock.id,
                journeyId: 'journeyId',
                input: {
                  url: 'viber://'
                }
              }
            },
            result
          }
        ]}
        cache={cache}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedBlock }}>
            <LinkAction />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'viber://' }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() =>
      expect(queryByText('Invalid URL')).not.toBeInTheDocument()
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() =>
      expect(cache.extract()['ButtonBlock:button1.id']?.action).toEqual({
        gtmEventName: 'gtmEventName',
        url: 'viber://'
      })
    )
  })

  it('rejects mailto links as a URL', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider mocks={mocks}>
        <EditorProvider>
          <LinkAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'mailto:test@test.com' }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(getByText('Invalid URL')).toBeInTheDocument())
  })

  it('should submit when enter is pressed', async () => {
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

    const { getByRole, queryByText } = render(
      <MockedProvider mocks={mocks} cache={cache}>
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedBlock }}>
            <LinkAction />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'https://github.com' }
    })
    fireEvent.submit(getByRole('textbox'), {
      target: { value: 'https://github.com' }
    })
    await waitFor(() =>
      expect(queryByText('Invalid URL')).not.toBeInTheDocument()
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() =>
      expect(cache.extract()['ButtonBlock:button1.id']?.action).toEqual({
        gtmEventName: 'gtmEventName',
        url: 'https://github.com'
      })
    )
  })
})
