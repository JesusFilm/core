import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { MessagePlatform } from '../enums'

export const JourneyVisitorRef = builder.prismaObject('JourneyVisitor', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId'),
    visitorId: t.exposeString('visitorId'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    duration: t.exposeInt('duration'),
    lastChatStartedAt: t.expose('lastChatStartedAt', {
      type: 'DateTime',
      nullable: true
    }),
    lastChatPlatform: t.expose('lastChatPlatform', {
      type: MessagePlatform,
      nullable: true
    }),
    lastStepViewedAt: t.expose('lastStepViewedAt', {
      type: 'DateTime',
      nullable: true
    }),
    lastLinkAction: t.exposeString('lastLinkAction', { nullable: true }),
    lastTextResponse: t.exposeString('lastTextResponse', { nullable: true }),
    lastRadioQuestion: t.exposeString('lastRadioQuestion', { nullable: true }),
    lastRadioOptionSubmission: t.exposeString('lastRadioOptionSubmission', {
      nullable: true
    }),
    activityCount: t.exposeInt('activityCount'),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    // Additional fields from visitor relation for convenience
    countryCode: t.field({
      type: 'String',
      nullable: true,
      resolve: async (journeyVisitor) => {
        const visitor = await prisma.visitor.findUnique({
          where: { id: journeyVisitor.visitorId },
          select: { countryCode: true }
        })
        return visitor?.countryCode || null
      }
    }),
    messagePlatform: t.field({
      type: MessagePlatform,
      nullable: true,
      resolve: async (journeyVisitor) => {
        const visitor = await prisma.visitor.findUnique({
          where: { id: journeyVisitor.visitorId },
          select: { messagePlatform: true }
        })
        return visitor?.messagePlatform || null
      }
    }),
    notes: t.field({
      type: 'String',
      nullable: true,
      resolve: async (journeyVisitor) => {
        const visitor = await prisma.visitor.findUnique({
          where: { id: journeyVisitor.visitorId },
          select: { notes: true }
        })
        return visitor?.notes || null
      }
    }),
    // Relations
    journey: t.relation('journey'),
    visitor: t.relation('visitor'),
    events: t.relation('events')
  })
})
