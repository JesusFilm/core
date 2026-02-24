import { builder } from '../../builder'
import { MessagePlatform, VideoBlockSource } from '../../enums'
import { Language } from '../../language/language'
import { ButtonActionEnum } from '../button/enums'
import { EventInterface } from '../event'

export const JourneyEventRef = builder.prismaNode('Event', {
  variant: 'JourneyEvent',
  interfaces: [EventInterface],
  id: { field: 'id' },
  shareable: true,
  fields: (t) => ({
    action: t.expose('action', { type: ButtonActionEnum, nullable: true }),
    actionValue: t.exposeString('actionValue', { nullable: true }),
    messagePlatform: t.expose('messagePlatform', {
      type: MessagePlatform,
      nullable: true
    }),
    language: t.field({
      type: Language,
      nullable: true,
      select: {
        languageId: true
      },
      resolve: async (event) => {
        if (!event.languageId) return null
        // Return a reference to the federated Language entity
        return { id: event.languageId }
      }
    }),
    email: t.exposeString('email', { nullable: true }),
    blockId: t.exposeString('blockId', { nullable: true }),
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSource, nullable: true }),
    progress: t.exposeInt('progress', { nullable: true }),

    // Database fields from the events table
    typename: t.exposeString('typename', { nullable: true }),
    visitorId: t.exposeString('visitorId', { nullable: true }),

    // Related fields queried from relevant ids in the events table
    journeySlug: t.field({
      type: 'String',
      nullable: true,
      select: {
        journey: {
          select: {
            slug: true
          }
        }
      },
      resolve: async (event) => {
        return event.journey?.slug ?? null
      }
    }),
    visitorName: t.field({
      type: 'String',
      nullable: true,
      select: {
        visitor: {
          select: {
            name: true
          }
        }
      },
      resolve: async (event: any) => {
        return event.visitor?.name ?? null
      }
    }),
    visitorEmail: t.field({
      type: 'String',
      nullable: true,
      select: {
        visitor: {
          select: {
            email: true
          }
        }
      },
      resolve: async (event: any) => {
        return event.visitor?.email ?? null
      }
    }),
    visitorPhone: t.field({
      type: 'String',
      nullable: true,
      select: {
        visitor: {
          select: {
            phone: true
          }
        }
      },
      resolve: async (event: any) => {
        return event.visitor?.phone ?? null
      }
    })
  })
})
