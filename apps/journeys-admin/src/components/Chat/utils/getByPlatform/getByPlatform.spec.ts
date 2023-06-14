import { ChatPlatform } from '../../../../../__generated__/globalTypes'
import { GetJourneyChatButtons_journey_chatButtons as ChatButton } from '../../../../../__generated__/GetJourneyChatButtons'
import { getByPlatform } from '.'

describe('getByPlatform', () => {
  const chatButtons: ChatButton[] = [
    {
      __typename: 'ChatButton',
      id: '1',
      link: 'https://example.com',
      platform: ChatPlatform.facebook
    },
    {
      __typename: 'ChatButton',
      id: '2',
      link: 'https://example.com',
      platform: ChatPlatform.whatsApp
    },
    {
      __typename: 'ChatButton',
      id: '3',
      link: 'https://example.com',
      platform: ChatPlatform.telegram
    },
    {
      __typename: 'ChatButton',
      id: '4',
      link: 'https://example.com',
      platform: ChatPlatform.tikTok
    }
  ]

  it('should return the custom button if not platform is given', () => {
    const result = getByPlatform(chatButtons)
    expect(result).toEqual(chatButtons[3])
  })

  it('returns the chat button with the specified platform when platform is provided', () => {
    const result = getByPlatform(chatButtons, ChatPlatform.facebook)
    expect(result).toEqual(chatButtons[0])
  })
})
