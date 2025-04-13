import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../../../__generated__/globalTypes'
import { blockActionEmailUpdateMock } from '../../../../../../../../../libs/useBlockActionEmailUpdateMutation/useBlockActionEmailUpdateMutation.mock'
import { blockActionNavigateToBlockUpdateMock } from '../../../../../../../../../libs/useBlockActionNavigateToBlockUpdateMutation/useBlockActionNavigateToBlockUpdateMutation.mock'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { EmailAction } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('EmailAction', () => {
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
      __typename: 'EmailAction',
      gtmEventName: 'gtmEventName',
      email: 'imissedmondshen@gmail.com'
    },
    children: []
  }

  it('displays the action email', async () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <EmailAction />
        </EditorProvider>
      </MockedProvider>
    )
    expect(
      screen.getByDisplayValue('imissedmondshen@gmail.com')
    ).toBeInTheDocument()
  })

  it('updates action email', async () => {
    const result = jest.fn().mockReturnValue(blockActionEmailUpdateMock.result)
    render(
      <MockedProvider mocks={[{ ...blockActionEmailUpdateMock, result }]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <EmailAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'edmondwashere@gmail.com' }
    })
    fireEvent.submit(screen.getByRole('textbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('is a required field', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <EmailAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Paste Email here...' }),
      {
        target: { value: '' }
      }
    )
    fireEvent.blur(screen.getByRole('textbox', { name: 'Paste Email here...' }))
    await waitFor(() =>
      expect(screen.getByText('Invalid Email')).toBeInTheDocument()
    )
  })

  it('should validate on incorrect email format', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <EmailAction />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'edmondshen-atgmail.com' }
    })
    fireEvent.blur(screen.getByRole('textbox'))
    await waitFor(() =>
      expect(
        screen.getByText('Email must be a valid email')
      ).toBeInTheDocument()
    )
  })

  it('should handle undo', async () => {
    const result = jest
      .fn()
      .mockReturnValue(blockActionNavigateToBlockUpdateMock.result)
    render(
      <MockedProvider
        mocks={[
          blockActionEmailUpdateMock,
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
          <EmailAction />
          <CommandUndoItem variant="button" />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'edmondwashere@gmail.com' }
    })
    fireEvent.blur(screen.getByRole('textbox'))
    const undo = screen.getByRole('button', { name: 'Undo' })
    await waitFor(() => expect(undo).not.toBeDisabled())
    fireEvent.click(undo)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
