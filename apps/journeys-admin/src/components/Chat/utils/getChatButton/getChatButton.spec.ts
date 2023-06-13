import { PlatformDetails } from '../../ChatOption/ChatOption'
import { Platform } from '../types'
import { getChatButton } from './getChatButton'

describe('getChatButton', () => {
  const chatButtons: PlatformDetails[] = [
    {
      id: '1',
      title: 'Facebook',
      linkValue: 'https://example.com/facebook',
      chatIcon: Platform.facebook,
      active: false
    },
    {
      id: '2',
      title: 'WhatsApp',
      linkValue: 'https://example.com/whatsapp',
      chatIcon: Platform.whatsApp,
      active: false
    },
    {
      id: '3',
      title: 'Telegram',
      linkValue: 'https://example.com/telegram',
      chatIcon: Platform.telegram,
      active: false
    }
  ]

  it('should return the chat button', () => {
    const result = getChatButton('2', chatButtons)
    expect(result).toEqual({
      id: '2',
      chatIcon: Platform.whatsApp,
      chatLink: 'https://example.com/whatsapp'
    })
  })

  it('should return undefined if no buttons match the id', () => {
    const result = getChatButton('4', chatButtons)
    expect(result).toBeUndefined()
  })
})
