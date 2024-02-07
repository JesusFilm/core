import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { ChatPlatform } from '../../../../../../../../../__generated__/globalTypes'
import { JourneyFields_chatButtons as ChatButton } from '../../../../../../../../../__generated__/JourneyFields'

import { ChatOption } from '.'

describe('ChatOption', () => {
  it('should show accordion summary and details', () => {
    const props = {
      title: 'title',
      chatButton: {
        id: 'chatButton.id',
        link: 'https://example.com',
        platform: ChatPlatform.facebook
      } as unknown as ChatButton,
      platform: ChatPlatform.facebook,
      active: true,
      helperInfo: 'helper info',
      journeyId: 'journeyId',
      disableSelection: false
    }

    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ChatOption {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'title' }))
    expect(getByRole('textbox')).toHaveValue('https://example.com')
  })

  it('should update currentLink locally', () => {
    const props = {
      title: 'title',
      chatButton: {
        id: 'chatButton.id',
        link: 'https://example.com',
        platform: ChatPlatform.whatsApp
      } as unknown as ChatButton,
      platform: ChatPlatform.whatsApp,
      active: true,
      helperInfo: 'helper info',
      journeyId: 'journeyId',
      disableSelection: false
    }

    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ChatOption {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'title' }))
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'https://newlink.com' }
    })
    expect(getByRole('textbox')).toHaveValue('https://newlink.com')
  })

  it('should update currentPlatform locally', () => {
    const props = {
      title: 'title',
      chatButton: {
        id: 'chatButton.id',
        link: 'https://example.com',
        platform: ChatPlatform.tikTok
      } as unknown as ChatButton,
      platform: ChatPlatform.tikTok,
      active: true,
      helperInfo: 'helper info',
      journeyId: 'journeyId',
      disableSelection: false,
      enableIconSelect: true
    }

    const { getByRole, getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ChatOption {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'title' }))
    fireEvent.mouseDown(getByRole('button', { name: 'TikTok' }))
    fireEvent.click(getByText('Snapchat'))
    expect(getByRole('button', { name: 'Snapchat' })).toBeInTheDocument()
  })

  it('should not close accordion when clicking on the checkbox', () => {
    const props = {
      title: 'title',
      chatButton: undefined,
      platform: ChatPlatform.tikTok,
      active: false,
      journeyId: 'journeyId',
      disableSelection: false
    }

    const { getByRole, queryByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ChatOption {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(queryByRole('textbox')).not.toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'title' }))
    fireEvent.click(getByRole('checkbox'))
    expect(getByRole('textbox')).toBeInTheDocument()
  })
})
