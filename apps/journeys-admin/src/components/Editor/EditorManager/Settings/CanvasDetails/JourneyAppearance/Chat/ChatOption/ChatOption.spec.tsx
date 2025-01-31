import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { MessagePlatform } from '../../../../../../../../../__generated__/globalTypes'
import { JourneyFields_chatButtons as ChatButton } from '../../../../../../../../../__generated__/JourneyFields'

import { ChatOption } from '.'

describe('ChatOption', () => {
  it('should render', () => {
    const props = {
      title: 'title',
      chatButton: {
        id: 'chatButton.id',
        link: 'https://example.com',
        platform: MessagePlatform.facebook
      } as unknown as ChatButton,
      platform: MessagePlatform.facebook,
      active: true,
      helperInfo: 'helper info',
      journeyId: 'journeyId',
      disableSelection: false
    }

    render(
      <MockedProvider>
        <SnackbarProvider>
          <ChatOption {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText(props.title)).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('https://example.com')
  })

  it('should update currentLink locally', () => {
    const props = {
      title: 'title',
      chatButton: {
        id: 'chatButton.id',
        link: 'https://example.com',
        platform: MessagePlatform.whatsApp
      } as unknown as ChatButton,
      platform: MessagePlatform.whatsApp,
      active: true,
      helperInfo: 'helper info',
      journeyId: 'journeyId',
      disableSelection: false
    }

    render(
      <MockedProvider>
        <SnackbarProvider>
          <ChatOption {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'https://newlink.com' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('https://newlink.com')
  })

  it('should update currentPlatform locally', () => {
    const props = {
      title: 'title',
      chatButton: {
        id: 'chatButton.id',
        link: 'https://example.com',
        platform: MessagePlatform.tikTok
      } as unknown as ChatButton,
      platform: MessagePlatform.tikTok,
      active: true,
      helperInfo: 'helper info',
      journeyId: 'journeyId',
      disableSelection: false,
      enableIconSelect: true
    }

    render(
      <MockedProvider>
        <SnackbarProvider>
          <ChatOption {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(screen.getByText('TikTok'))
    fireEvent.click(screen.getByText('Snapchat'))
    expect(screen.getByRole('combobox')).toHaveTextContent('Snapchat')
  })
})
