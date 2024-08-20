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

  it('should return globe2 icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.globe2} />)
    expect(screen.getByTestId('Globe2Icon')).toBeInTheDocument()
  })

  it('should return globe3 icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.globe3} />)
    expect(screen.getByTestId('Globe3Icon')).toBeInTheDocument()
  })

  it('should return messageText1 icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.messageText1} />)
    expect(screen.getByTestId('MessageText1Icon')).toBeInTheDocument()
  })

  it('should return messageText2 icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.messageText2} />)
    expect(screen.getByTestId('MessageText2Icon')).toBeInTheDocument()
  })

  it('should return send1 icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.send1} />)
    expect(screen.getByTestId('Send1Icon')).toBeInTheDocument()
  })

  it('should return send2 icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.send2} />)
    expect(screen.getByTestId('Send2Icon')).toBeInTheDocument()
  })

  it('should return messageChat2 icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.messageChat2} />)
    expect(screen.getByTestId('MessageChat2Icon')).toBeInTheDocument()
  })

  it('should return messageCircle icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.messageCircle} />)
    expect(screen.getByTestId('MessageCircleIcon')).toBeInTheDocument()
  })

  it('should return messageNotifyCircle icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.messageNotifyCircle} />)
    expect(screen.getByTestId('MessageNotifyCircleIcon')).toBeInTheDocument()
  })

  it('should return messageNotifySquare icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.messageNotifySquare} />)
    expect(screen.getByTestId('MessageNotifySquareIcon')).toBeInTheDocument()
  })

  it('should return messageSquare icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.messageSquare} />)
    expect(screen.getByTestId('MessageSquareIcon')).toBeInTheDocument()
  })

  it('should return mail1 icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.mail1} />)
    expect(screen.getByTestId('Mail1Icon')).toBeInTheDocument()
  })

  it('should return linkExternal icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.linkExternal} />)
    expect(screen.getByTestId('LinkExternalIcon')).toBeInTheDocument()
  })

  it('should return home3 icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.home3} />)
    expect(screen.getByTestId('Home3Icon')).toBeInTheDocument()
  })

  it('should return home4 icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.home4} />)
    expect(screen.getByTestId('Home4Icon')).toBeInTheDocument()
  })

  it('should return helpCircleContained icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.helpCircleContained} />)
    expect(screen.getByTestId('HelpCircleContainedIcon')).toBeInTheDocument()
  })

  it('should return helpCircleSquare icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.helpSquareContained} />)
    expect(screen.getByTestId('HelpSquareContainedIcon')).toBeInTheDocument()
  })

  it('should return shieldCheck icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.shieldCheck} />)
    expect(screen.getByTestId('ShieldCheckIcon')).toBeInTheDocument()
  })

  it('should return menu1 icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.menu1} />)
    expect(screen.getByTestId('Menu1Icon')).toBeInTheDocument()
  })

  it('should return checkBroken icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.checkBroken} />)
    expect(screen.getByTestId('CheckBrokenIcon')).toBeInTheDocument()
  })

  it('should return checkContained icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.checkContained} />)
    expect(screen.getByTestId('CheckContainedIcon')).toBeInTheDocument()
  })

  it('should return settings icon', () => {
    render(<MessageChatIcon platform={MessagePlatform.settings} />)
    expect(screen.getByTestId('SettingsIcon')).toBeInTheDocument()
  })
})
