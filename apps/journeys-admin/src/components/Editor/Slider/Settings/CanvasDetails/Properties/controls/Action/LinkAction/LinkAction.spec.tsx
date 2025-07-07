import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../../../__generated__/globalTypes'
import { BLOCK_ACTION_LINK_UPDATE } from '../../../../../../../../../libs/useBlockActionLinkUpdateMutation'
import { blockActionLinkUpdateMock } from '../../../../../../../../../libs/useBlockActionLinkUpdateMutation/useBlockActionLinkUpdateMutation.mock'
import { blockActionNavigateToBlockUpdateMock } from '../../../../../../../../../libs/useBlockActionNavigateToBlockUpdateMutation/useBlockActionNavigateToBlockUpdateMutation.mock'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { LinkAction } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('LinkAction', () => {
  const selectedBlock: TreeBlock = {
    __typename: 'ButtonBlock',
    id: 'button2.id',
    parentBlockId: 'card1.id',
    parentOrder: 4,
    label: 'Contact Us',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.large,
    startIconId: null,
    endIconId: null,
    submitEnabled: null,
    action: {
      parentBlockId: 'button2.id',
      __typename: 'LinkAction',
      gtmEventName: 'gtmEventName',
      url: 'https://www.google.com'
    },
    children: [],
    settings: null
  }

  it('displays the action url', async () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <LinkAction />
        </EditorProvider>
      </MockedProvider>
    )
    expect(
      screen.getByDisplayValue('https://www.google.com')
    ).toBeInTheDocument()
  })

  it('updates action url', async () => {
    const result = jest.fn().mockReturnValue(blockActionLinkUpdateMock.result)
    render(
      <MockedProvider mocks={[{ ...blockActionLinkUpdateMock, result }]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <LinkAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'https://github.com' }
    })
    fireEvent.blur(screen.getByRole('textbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('is a required field', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <LinkAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Paste URL here...' }),
      {
        target: { value: '' }
      }
    )
    fireEvent.blur(screen.getByRole('textbox', { name: 'Paste URL here...' }))
    await waitFor(() =>
      expect(screen.getByText('Required')).toBeInTheDocument()
    )
  })

  it('accepts links without protocol as a URL', async () => {
    const result = jest.fn().mockReturnValue(blockActionLinkUpdateMock.result)
    render(
      <MockedProvider mocks={[{ ...blockActionLinkUpdateMock, result }]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <LinkAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'github.com' }
    })
    fireEvent.blur(screen.getByRole('textbox'))
    await waitFor(() =>
      expect(screen.queryByText('Invalid URL')).not.toBeInTheDocument()
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

    render(
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
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'viber://' }
    })
    fireEvent.blur(screen.getByRole('textbox'))
    await waitFor(() =>
      expect(screen.queryByText('Invalid URL')).not.toBeInTheDocument()
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('rejects mailto links as a URL', async () => {
    render(
      <MockedProvider mocks={[blockActionLinkUpdateMock]}>
        <EditorProvider>
          <LinkAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'mailto:test@test.com' }
    })
    fireEvent.blur(screen.getByRole('textbox'))
    await waitFor(() =>
      expect(screen.getByText('Invalid URL')).toBeInTheDocument()
    )
  })

  it('should submit when enter is pressed', async () => {
    const result = jest.fn().mockReturnValue(blockActionLinkUpdateMock.result)
    render(
      <MockedProvider mocks={[{ ...blockActionLinkUpdateMock, result }]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <LinkAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'https://github.com' }
    })
    fireEvent.submit(screen.getByRole('textbox'), {
      target: { value: 'https://github.com' }
    })
    await waitFor(() =>
      expect(screen.queryByText('Invalid URL')).not.toBeInTheDocument()
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should handle undo', async () => {
    const result = jest
      .fn()
      .mockReturnValue(blockActionNavigateToBlockUpdateMock.result)
    render(
      <MockedProvider
        mocks={[
          blockActionLinkUpdateMock,
          { ...blockActionNavigateToBlockUpdateMock, result }
        ]}
      >
        <EditorProvider
          initialState={{
            selectedBlock: {
              ...selectedBlock,
              action: {
                parentBlockId: 'button2.id',
                __typename: 'NavigateToBlockAction',
                gtmEventName: 'gtmEventName',
                blockId: 'step2.id'
              }
            }
          }}
        >
          <LinkAction />
          <CommandUndoItem variant="button" />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'https://github.com' }
    })
    fireEvent.blur(screen.getByRole('textbox'))
    const undo = screen.getByRole('button', { name: 'Undo' })
    await waitFor(() => expect(undo).not.toBeDisabled())
    fireEvent.click(undo)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
