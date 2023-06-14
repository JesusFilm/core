import { PlatformDetails } from '../../ChatOption/ChatOption'
import { ChatPlatform } from '../../../../../../../../../../__generated__/globalTypes'
import { getChatButton } from './getChatButton'

describe('getChatButton', () => {
  const chatButtons: PlatformDetails[] = [
    {
      id: '1',
      title: 'Facebook',
      link: 'https://example.com/facebook',
      platform: ChatPlatform.facebook,
      active: false
    },
    {
      id: '2',
      title: 'WhatsApp',
      link: 'https://example.com/whatsapp',
      platform: ChatPlatform.whatsApp,
      active: false
    },
    {
      id: '3',
      title: 'Telegram',
      link: 'https://example.com/telegram',
      platform: ChatPlatform.telegram,
      active: false
    }
  ]

  it('should return the chat button', () => {
    const result = getChatButton('2', chatButtons)
    expect(result).toEqual({
      id: '2',
      platform: ChatPlatform.whatsApp,
      link: 'https://example.com/whatsapp'
    })
  })

  it('should return undefined if no buttons match the id', () => {
    const result = getChatButton('4', chatButtons)
    expect(result).toBeUndefined()
  })
})
