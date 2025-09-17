/* eslint-disable jest/valid-title */
import { TFunction } from 'i18next'

import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { MessagePlatform } from '../../../../../__generated__/globalTypes'

import { getJourneyLinks } from './getJourneyLinks'

const t = ((key: string) => key) as unknown as TFunction

describe('getJourneyLinks', () => {
  it('returns empty array if no journey is provided', () => {
    expect(getJourneyLinks(t, undefined)).toEqual([])
  })

  it('should return chat buttons as links without step association', () => {
    const journey = {
      chatButtons: [
        {
          id: 'chat-1',
          platform: MessagePlatform.whatsApp,
          link: 'https://wa.me/123'
        },
        { id: 'chat-2', platform: null, link: 'https://example.com' }
      ],
      blocks: []
    } as unknown as Journey
    const links = getJourneyLinks(t, journey)
    expect(links).toEqual([
      {
        id: 'chat-1',
        linkType: 'chatButtons',
        url: 'https://wa.me/123',
        label: 'Chat: whatsApp'
      },
      {
        id: 'chat-2',
        linkType: 'chatButtons',
        url: 'https://example.com',
        label: 'Chat: '
      }
    ])
  })

  it('returns empty array if journey has no blocks', () => {
    const journey = { chatButtons: [], blocks: [] } as unknown as Journey
    expect(getJourneyLinks(t, journey)).toEqual([])
  })

  it('should extract customizable links and use default label when missing', () => {
    const journey = {
      journeyCustomizationFields: [{ key: 'firstName', value: 'Bob' }],
      chatButtons: [],
      blocks: [
        {
          __typename: 'ButtonBlock',
          id: 'btn-1',
          label: 'Hi {{firstName}}',
          action: {
            __typename: 'LinkAction',
            url: 'https://example.com',
            customizable: true,
            parentStepId: 'step-1'
          }
        },
        {
          __typename: 'RadioOptionBlock',
          id: 'opt-1',
          label: 'Pick',
          action: {
            __typename: 'EmailAction',
            email: 'test@example.com',
            customizable: true,
            parentStepId: 'step-2'
          }
        },
        {
          __typename: 'VideoBlock',
          id: 'vid-1',
          title: '',
          action: {
            __typename: 'LinkAction',
            url: 'https://video-link',
            customizable: true,
            parentStepId: 'step-3'
          }
        },
        {
          __typename: 'VideoTriggerBlock',
          id: 'trg-1',
          triggerAction: {
            __typename: 'LinkAction',
            url: 'https://ignored',
            customizable: true,
            parentStepId: 'step-4'
          }
        },
        {
          __typename: 'ButtonBlock',
          id: 'btn-2',
          label: 'Not customizable',
          action: {
            __typename: 'LinkAction',
            url: 'https://not-included',
            customizable: false,
            parentStepId: 'step-5'
          }
        }
      ]
    } as unknown as Journey

    const links = getJourneyLinks(t, journey)
    expect(links).toEqual([
      {
        id: 'btn-1',
        linkType: 'url',
        url: 'https://example.com',
        label: 'Hi Bob',
        parentStepId: 'step-1',
        customizable: true
      },
      {
        id: 'opt-1',
        linkType: 'email',
        url: 'test@example.com',
        label: 'Pick',
        parentStepId: 'step-2',
        customizable: true
      },
      {
        id: 'vid-1',
        linkType: 'url',
        url: 'https://video-link',
        label: 'No label provided',
        parentStepId: 'step-3',
        customizable: true
      },
      {
        id: 'trg-1',
        linkType: 'url',
        url: 'https://ignored',
        label: 'No label provided',
        parentStepId: 'step-4',
        customizable: true
      }
    ])
  })
})
