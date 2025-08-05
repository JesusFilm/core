import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { MessagePlatform } from '../enums'

export const JourneyVisitorRef = builder.prismaObject('JourneyVisitor', {
  shareable: true,
  fields: (t) => ({
    journeyId: t.exposeID('journeyId'),
    visitorId: t.exposeID('visitorId'),
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
    visitor: t.relation('visitor'),
    events: t.relation('events')
  })
})

builder.asEntity(JourneyVisitorRef, {
  key: builder.selection<{ visitorId: string; journeyId: string }>(
    'visitorId journeyId'
  ),
  resolveReference: async (journeyVisitor) => {
    return await prisma.journeyVisitor.findUnique({
      where: {
        journeyId_visitorId: {
          visitorId: journeyVisitor.visitorId,
          journeyId: journeyVisitor.journeyId
        }
      }
    })
  }
})
