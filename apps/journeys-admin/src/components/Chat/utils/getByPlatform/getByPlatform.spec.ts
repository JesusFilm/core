import { ChatButton, Platform } from '../types'
import { getByPlatform } from './getByPlatform'

describe('getByPlatform', () => {
  const chatButtons: ChatButton[] = [
    {
      id: '1',
      chatLink: 'https://example.com',
      chatIcon: Platform.facebook
    },
    {
      id: '2',
      chatLink: 'https://example.com',
      chatIcon: Platform.whatsApp
    },
    {
      id: '3',
      chatLink: 'https://example.com',
      chatIcon: Platform.telegram
    },
    {
      id: '4',
      chatLink: 'https://example.com',
      chatIcon: Platform.tikTok
    }
  ]

  it('should return the custom button if not platform is given', () => {
    const result = getByPlatform(chatButtons)
    expect(result).toEqual(chatButtons[3])
  })

  it('returns the chat button with the specified platform when platform is provided', () => {
    const result = getByPlatform(chatButtons, Platform.facebook)
    expect(result).toEqual(chatButtons[0])
  })
})
