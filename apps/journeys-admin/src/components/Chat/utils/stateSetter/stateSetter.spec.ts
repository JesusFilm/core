import { PlatformDetails } from '../../ChatOption/ChatOption'
import { ChatButton, Platform } from '../types'
import { stateSetter } from './stateSetter'

describe('stateSetter', () => {
  it('sets the state correctly when chatButton is provided', () => {
    const chatButton: ChatButton = {
      id: '1',
      chatIcon: Platform.facebook,
      chatLink: 'https://example.com/facebook'
    }
    const state: PlatformDetails = {
      id: '',
      title: '',
      linkValue: '',
      active: false,
      chatIcon: undefined
    }

    const updater = jest.fn()
    updater.mockReturnValue({
      ...state,
      id: chatButton.id,
      linkValue: chatButton.chatLink,
      chatIcon: chatButton.chatIcon,
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
      linkValue: '',
      active: false,
      chatIcon: undefined
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
