import { render, screen } from '@testing-library/react'
import { MessagePlatform } from '../../../__generated__/globalTypes'
import { MessageChatIcon } from './MessageChatIcon'

describe('MessageChatIcon', () => {
  it('should return facebook icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.facebook} />)
    expect(screen.getByTestId('FacebookIcon')).toBeInTheDocument()
  })
  it('should return telegram icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.telegram} />)
    expect(screen.getByTestId('TelegramIcon')).toBeInTheDocument()
  })
  it('should return whatsApp icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.whatsApp} />)
    expect(screen.getByTestId('WhatsAppIcon')).toBeInTheDocument()
  })
  it('should return instagram icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.instagram} />)
    expect(screen.getByTestId('InstagramIcon')).toBeInTheDocument()
  })
  it('should return viber icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.viber} />)
    expect(screen.getByTestId('ViberIcon')).toBeInTheDocument()
  })
  it('should return vk icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.vk} />)
    expect(screen.getByTestId('VkIcon')).toBeInTheDocument()
  })
  it('should return snapchat icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.snapchat} />)
    expect(screen.getByTestId('SnapchatIcon')).toBeInTheDocument()
  })
  it('should return skype icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.skype} />)
    expect(screen.getByTestId('SkypeIcon')).toBeInTheDocument()
  })
  it('should return line icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.line} />)
    expect(screen.getByTestId('LineIcon')).toBeInTheDocument()
  })
  it('should return tikTok icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.tikTok} />)
    expect(screen.getByTestId('TiktokIcon')).toBeInTheDocument()
  })
  it('should return custom icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.custom} />)
    expect(screen.getByTestId('MessageTypingIcon')).toBeInTheDocument()
  })
})
