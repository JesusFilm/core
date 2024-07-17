import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { LinkAction } from '.'
import { BLOCK_ACTION_LINK_UPDATE } from '../../../../../../../../../libs/useBlockActionLinkUpdateMutation'
import { blockActionLinkUpdateMock } from '../../../../../../../../../libs/useBlockActionLinkUpdateMutation/useBlockActionLinkUpdateMutation.mock'
import { steps } from '../data'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('LinkAction', () => {
  const selectedBlock = steps[1].children[0].children[3]

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
    const result = jest.fn().mockReturnValue(blockActionLinkUpdateMock.result)
    const { getByRole } = render(
      <MockedProvider mocks={[{ ...blockActionLinkUpdateMock, result }]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <LinkAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'https://github.com' }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
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
    const result = jest.fn().mockReturnValue(blockActionLinkUpdateMock.result)
    const { queryByText, getByRole } = render(
      <MockedProvider mocks={[{ ...blockActionLinkUpdateMock, result }]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <LinkAction />
        </EditorProvider>
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
  })

  it('accepts deep links as a URL', async () => {
    const result = jest.fn(() => ({
      data: {
        blockUpdateLinkAction: {
          parentBlockId: selectedBlock.id,
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
              query: BLOCK_ACTION_LINK_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  url: 'viber://'
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
      target: { value: 'viber://' }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() =>
      expect(queryByText('Invalid URL')).not.toBeInTheDocument()
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('rejects mailto links as a URL', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider mocks={[blockActionLinkUpdateMock]}>
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
    const result = jest.fn().mockReturnValue(blockActionLinkUpdateMock.result)
    const { getByRole, queryByText } = render(
      <MockedProvider mocks={[{ ...blockActionLinkUpdateMock, result }]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <LinkAction />
        </EditorProvider>
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
  })
})
