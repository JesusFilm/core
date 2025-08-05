import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { MessagePlatform } from '../enums'

import { VisitorStatus } from './enums'
import { UserAgentRef } from './userAgent'

export const VisitorRef = builder.prismaObject('Visitor', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id'),
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
    userAgent: t.field({
      type: UserAgentRef,
      nullable: true,
      resolve: (visitor) => visitor.userAgent as any
    }),
    countryCode: t.exposeString('countryCode', { nullable: true }),
    name: t.exposeString('name', { nullable: true }),
    email: t.exposeString('email', { nullable: true }),
    status: t.expose('status', { type: VisitorStatus, nullable: true }),
    messagePlatform: t.expose('messagePlatform', {
      type: MessagePlatform,
      nullable: true
    }),
    messagePlatformId: t.exposeString('messagePlatformId', { nullable: true }),
    notes: t.exposeString('notes', { nullable: true }),
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
    referrer: t.exposeString('referrer', { nullable: true }),
    phone: t.exposeString('phone', { nullable: true }),
    teamId: t.exposeString('teamId'),
    userId: t.exposeString('userId'),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    // Relations
    team: t.relation('team'),
    journeyVisitors: t.relation('journeyVisitors'),
    events: t.relation('events')
  })
})

builder.asEntity(VisitorRef, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async (visitor) => {
    return await prisma.visitor.findUnique({
      where: { id: visitor.id }
    })
  }
})
