import { fireEvent, render } from '@testing-library/react'

import { MessagePlatform } from '../../../../../__generated__/globalTypes'

import { ChatButton } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('ChatButton', () => {
  window.open = jest.fn()

  it('should handle click for facebook', () => {
    const { getByRole } = render(
      <ChatButton
        messagePlatform={MessagePlatform.facebook}
        messagePlatformId="testId"
      />
    )
    fireEvent.click(getByRole('button'))
    expect(window.open).toHaveBeenCalledWith('https://m.me/testId')
  })

  it('should handle click for instagram', () => {
    const { getByRole } = render(
      <ChatButton
        messagePlatform={MessagePlatform.instagram}
        messagePlatformId="testId"
      />
    )
    fireEvent.click(getByRole('button'))
    expect(window.open).toHaveBeenCalledWith(
      'https://www.instagram.com/direct/t/testId'
    )
  })

  it('should handle click for line', () => {
    const { getByRole } = render(
      <ChatButton
        messagePlatform={MessagePlatform.line}
        messagePlatformId="testId"
      />
    )
    fireEvent.click(getByRole('button'))
    expect(window.open).toHaveBeenCalledWith('https://ln.ee/testId')
  })

  it('should handle click for skype', () => {
    const { getByRole } = render(
      <ChatButton
        messagePlatform={MessagePlatform.skype}
        messagePlatformId="testId"
      />
    )
    fireEvent.click(getByRole('button'))
    expect(window.open).toHaveBeenCalledWith('https://web.skype.com')
  })

  it('should handle click for snapchat', () => {
    const { getByRole } = render(
      <ChatButton
        messagePlatform={MessagePlatform.snapchat}
        messagePlatformId="testId"
      />
    )
    fireEvent.click(getByRole('button'))
    expect(window.open).toHaveBeenCalledWith('https://web.snapchat.com/testId')
  })

  it('should handle click for telegram', () => {
    const { getByRole } = render(
      <ChatButton
        messagePlatform={MessagePlatform.telegram}
        messagePlatformId="testId"
      />
    )
    fireEvent.click(getByRole('button'))
    expect(window.open).toHaveBeenCalledWith(
      'https://web.telegram.org/z/#testId'
    )
  })

  it('should handle click for tikTok', () => {
    const { getByRole } = render(
      <ChatButton
        messagePlatform={MessagePlatform.tikTok}
        messagePlatformId="testId"
      />
    )
    fireEvent.click(getByRole('button'))
    expect(window.open).toHaveBeenCalledWith('https://www.tiktok.com/@testId')
  })

  it('should handle click for viber', () => {
    const { getByRole } = render(
      <ChatButton
        messagePlatform={MessagePlatform.viber}
        messagePlatformId="testId"
      />
    )
    fireEvent.click(getByRole('button'))
    expect(window.open).toHaveBeenCalledWith('https://chats.viber.com/testId')
  })

  it('should handle click for vk', () => {
    const { getByRole } = render(
      <ChatButton
        messagePlatform={MessagePlatform.vk}
        messagePlatformId="testId"
      />
    )
    fireEvent.click(getByRole('button'))
    expect(window.open).toHaveBeenCalledWith('https://vk.com/testId')
  })

  it('should handle click for whatsApp', () => {
    const { getByRole } = render(
      <ChatButton
        messagePlatform={MessagePlatform.whatsApp}
        messagePlatformId="testId"
      />
    )
    fireEvent.click(getByRole('button'))
    expect(window.open).toHaveBeenCalledWith('https://wa.me/testId')
  })

  it('should be disabled if messagePlatform or messagePlatformId is null', () => {
    const { getByRole } = render(<ChatButton />)
    expect(getByRole('button')).toBeDisabled()
  })
})
