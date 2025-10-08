import { MessagePlatform } from '../../../../../__generated__/globalTypes'
import { ButtonFields_action } from '../../__generated__/ButtonFields'

import { findMessagePlatform } from '.'

describe('findMessagePlatform', () => {
  const defaultAction: ButtonFields_action = {
    __typename: 'LinkAction',
    parentBlockId: 'button.id',
    gtmEventName: 'click',
    url: 'https://google.com',
    customizable: null,
    parentStepId: null
  }

  it('should return facebook', () => {
    const action1 = {
      ...defaultAction,
      url: 'https://m.me/some-user'
    }
    const action2 = {
      ...defaultAction,
      url: 'https://fb.me/some-user'
    }
    const action3 = {
      ...defaultAction,
      url: 'https://www.messenger.com/t/some-user'
    }

    expect(findMessagePlatform(action1)).toEqual(MessagePlatform.facebook)
    expect(findMessagePlatform(action2)).toEqual(MessagePlatform.facebook)
    expect(findMessagePlatform(action3)).toEqual(MessagePlatform.facebook)
  })

  it('should return telegram', () => {
    const action1 = {
      ...defaultAction,
      url: 'https://t.me/some-user'
    }
    const action2 = {
      ...defaultAction,
      url: 'https://telegram.org/some-user'
    }

    expect(findMessagePlatform(action1)).toEqual(MessagePlatform.telegram)
    expect(findMessagePlatform(action2)).toEqual(MessagePlatform.telegram)
  })

  it('should return whatsApp', () => {
    const action1 = {
      ...defaultAction,
      url: 'https://wa.me/some-user'
    }
    const action2 = {
      ...defaultAction,
      url: 'whatsapp://some-user'
    }
    const action3 = {
      ...defaultAction,
      url: 'api.whatsapp.com/some-user'
    }

    expect(findMessagePlatform(action1)).toEqual(MessagePlatform.whatsApp)
    expect(findMessagePlatform(action2)).toEqual(MessagePlatform.whatsApp)
    expect(findMessagePlatform(action3)).toEqual(MessagePlatform.whatsApp)
  })

  it('should return instagram', () => {
    const action = {
      ...defaultAction,
      url: 'https://instagram.com/some-user'
    }

    expect(findMessagePlatform(action)).toEqual(MessagePlatform.instagram)
  })

  it('should return viber', () => {
    const action1 = {
      ...defaultAction,
      url: 'viber://some-user'
    }
    const action2 = {
      ...defaultAction,
      url: 'https://viber.me/some-user'
    }
    const action3 = {
      ...defaultAction,
      url: 'https://vb.me/some-user'
    }
    expect(findMessagePlatform(action1)).toEqual(MessagePlatform.viber)
    expect(findMessagePlatform(action2)).toEqual(MessagePlatform.viber)
    expect(findMessagePlatform(action3)).toEqual(MessagePlatform.viber)
  })

  it('should return vk', () => {
    const action1 = {
      ...defaultAction,
      url: 'vk://some-user'
    }
    const action2 = {
      ...defaultAction,
      url: 'https://vk.com/some-user'
    }

    expect(findMessagePlatform(action1)).toEqual(MessagePlatform.vk)
    expect(findMessagePlatform(action2)).toEqual(MessagePlatform.vk)
  })

  it('should return snapchat', () => {
    const action = {
      ...defaultAction,
      url: 'https://snapchat.com/some-user'
    }

    expect(findMessagePlatform(action)).toEqual(MessagePlatform.snapchat)
  })

  it('should return skype', () => {
    const action = {
      ...defaultAction,
      url: 'https://skype.com/some-user'
    }

    expect(findMessagePlatform(action)).toEqual(MessagePlatform.skype)
  })

  it('should return line', () => {
    const action1 = {
      ...defaultAction,
      url: 'line://some-user'
    }
    const action2 = {
      ...defaultAction,
      url: 'line.me'
    }

    expect(findMessagePlatform(action1)).toEqual(MessagePlatform.line)
    expect(findMessagePlatform(action2)).toEqual(MessagePlatform.line)
  })

  it('should return tikTok', () => {
    const action = {
      ...defaultAction,
      url: 'https://tiktok.com/@some-user'
    }

    expect(findMessagePlatform(action)).toEqual(MessagePlatform.tikTok)
  })

  it('should return undefined', () => {
    expect(findMessagePlatform(defaultAction)).toBeUndefined()
  })
})
