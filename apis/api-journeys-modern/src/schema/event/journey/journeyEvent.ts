import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { MessagePlatform, VideoBlockSource } from '../../enums'
import { Language } from '../../language/language'
import { ButtonActionEnum } from '../button/enums'
import { EventInterface } from '../event'

const JourneyEventRef = builder.prismaNode('Event', {
  variant: 'JourneyEvent',
  interfaces: [EventInterface],
  id: { field: 'id' },
  nullable: true,
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
      resolve: async (event) => {
        if (!event.journeyId) return null
        const journey = await prisma.journey.findUnique({
          where: { id: event.journeyId },
          select: { slug: true }
        })
        return journey?.slug ?? null
      }
    }),
    visitorName: t.field({
      type: 'String',
      nullable: true,
      resolve: async (event) => {
        if (!event.visitorId) return null
        const visitor = await prisma.visitor.findUnique({
          where: { id: event.visitorId },
          select: { name: true }
        })
        return visitor?.name ?? null
      }
    }),
    visitorEmail: t.field({
      type: 'String',
      nullable: true,
      resolve: async (event) => {
        if (!event.visitorId) return null
        const visitor = await prisma.visitor.findUnique({
          where: { id: event.visitorId },
          select: { email: true }
        })
        return visitor?.email ?? null
      }
    }),
    visitorPhone: t.field({
      type: 'String',
      nullable: true,
      resolve: async (event) => {
        if (!event.visitorId) return null
        const visitor = await prisma.visitor.findUnique({
          where: { id: event.visitorId },
          select: { phone: true }
        })
        return visitor?.phone ?? null
      }
    })
  })
})
