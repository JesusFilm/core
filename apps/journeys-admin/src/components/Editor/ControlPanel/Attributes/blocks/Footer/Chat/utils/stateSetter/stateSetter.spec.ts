import { PlatformDetails } from '../../ChatOption/ChatOption'
import { ChatPlatform } from '../../../../../../../../../../__generated__/globalTypes'
import { GetJourneyChatButtons_journey_chatButtons as ChatButton } from '../../../../../../../../../../__generated__/GetJourneyChatButtons'
import { stateSetter } from './stateSetter'

describe('stateSetter', () => {
  it('sets the state correctly when chatButton is provided', () => {
    const chatButton: ChatButton = {
      __typename: 'ChatButton',
      id: '1',
      platform: ChatPlatform.facebook,
      link: 'https://example.com/facebook'
    }
    const state: PlatformDetails = {
      id: '',
      title: '',
      link: '',
      active: false,
      platform: null
    }

    const updater = jest.fn()
    updater.mockReturnValue({
      ...state,
      id: chatButton.id,
      link: chatButton.link,
      platform: chatButton.platform,
      active: true
    })
    const mockSetState = jest.fn(updater)

    stateSetter(mockSetState, chatButton)
    expect(updater).toHaveBeenCalled()
  })

  it('sets the state correctly when chatButton is not provided', () => {
    const state: PlatformDetails = {
      id: '',
      title: '',
      link: '',
      active: false,
      platform: null
    }

    const updater = jest.fn()
    updater.mockReturnValue({
      ...state,
      active: false
    })
    const mockSetState = jest.fn(updater)

    stateSetter(mockSetState)
    expect(updater).toHaveBeenCalled()
  })
})
