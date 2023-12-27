import omit from 'lodash/omit'

import { PrismaClient } from '.prisma/api-journeys-client'

const prisma = new PrismaClient()

const handledIds: string[] = []
export async function distinctVisitor(): Promise<void> {
  const visitors = await prisma.visitor.findMany({
    select: { id: true, userId: true, teamId: true }
  })
  for (let i = 0; i < visitors.length; i++) {
    const visitor = visitors[i]
    if (handledIds.includes(visitor.id)) continue

    const duplicates = await prisma.visitor.findMany({
      where: { userId: visitor.userId, teamId: visitor.teamId }
    })
    if (duplicates.length < 2) {
      handledIds.push(visitor.id)
      console.log('no duplicates found for', visitor.userId)
      continue
    }

    const newInitial = duplicates[0]
    console.log('initial value:', newInitial)

    for (let j = 1; j < duplicates.length; j++) {
      const nextVisitor = duplicates[j]

      if (newInitial.createdAt > nextVisitor.createdAt)
        newInitial.createdAt = nextVisitor.createdAt
      if (newInitial.countryCode != null)
        newInitial.countryCode = nextVisitor.countryCode

      if (newInitial.duration < nextVisitor.duration)
        newInitial.duration = nextVisitor.duration

      if (nextVisitor.email != null) newInitial.email = nextVisitor.email

      if (
        (newInitial.lastChatStartedAt ?? 0) <
        (nextVisitor.lastChatStartedAt ?? 0)
      ) {
        newInitial.lastChatStartedAt = nextVisitor.lastChatStartedAt
        newInitial.lastChatPlatform = nextVisitor.lastChatPlatform
      }

      if (
        (newInitial.lastStepViewedAt ?? 0) < (nextVisitor.lastStepViewedAt ?? 0)
      )
        newInitial.lastStepViewedAt = nextVisitor.lastStepViewedAt

      if (nextVisitor.lastLinkAction != null)
        newInitial.lastLinkAction = nextVisitor.lastLinkAction

      if (nextVisitor.lastTextResponse != null)
        newInitial.lastTextResponse = nextVisitor.lastTextResponse

      if (nextVisitor.lastRadioQuestion != null)
        newInitial.lastRadioQuestion = nextVisitor.lastRadioQuestion

      if (nextVisitor.lastRadioOptionSubmission != null)
        newInitial.lastRadioOptionSubmission =
          nextVisitor.lastRadioOptionSubmission

      if (nextVisitor.messagePlatform != null) {
        newInitial.messagePlatform = nextVisitor.messagePlatform
        newInitial.messagePlatformId = nextVisitor.messagePlatformId
      }

      if (nextVisitor.name != null) newInitial.name = nextVisitor.name

      if (nextVisitor.notes != null) newInitial.notes = nextVisitor.notes

      if (nextVisitor.status != null) newInitial.status = nextVisitor.status

      if (nextVisitor.userAgent != null)
        newInitial.userAgent = nextVisitor.userAgent

      if (nextVisitor.referrer != null)
        newInitial.referrer = nextVisitor.referrer

      if (newInitial.updatedAt < nextVisitor.updatedAt)
        newInitial.updatedAt = nextVisitor.updatedAt

      await prisma.visitor.update({
        where: { id: newInitial.id },
        data: omit(newInitial, ['id', 'userAgent'])
      })

      const journeyVisitors = await prisma.journeyVisitor.findMany({
        where: { visitorId: nextVisitor.id }
      })

      for (let k = 0; k < journeyVisitors.length; k++) {
        const journeyVisitor = journeyVisitors[k]
        const existingJV = await prisma.journeyVisitor.findUnique({
          where: {
            journeyId_visitorId: {
              journeyId: journeyVisitor.journeyId,
              visitorId: newInitial.id
            }
          }
        })

        if (existingJV == null) {
          await prisma.journeyVisitor.update({
            where: { id: journeyVisitor.id },
            data: { visitorId: newInitial.id }
          })
        } else {
          if (existingJV.createdAt > journeyVisitor.createdAt)
            existingJV.createdAt = journeyVisitor.createdAt
          if (existingJV.duration < journeyVisitor.duration)
            existingJV.duration = journeyVisitor.duration
          if (journeyVisitor.lastChatStartedAt != null) {
            existingJV.lastChatStartedAt = journeyVisitor.lastChatStartedAt
            existingJV.lastChatPlatform = journeyVisitor.lastChatPlatform
          }
          if (journeyVisitor.lastStepViewedAt != null)
            existingJV.lastStepViewedAt = journeyVisitor.lastStepViewedAt
          if (existingJV.lastLinkAction != null)
            existingJV.lastLinkAction = journeyVisitor.lastLinkAction
          if (existingJV.lastTextResponse != null)
            existingJV.lastTextResponse = journeyVisitor.lastTextResponse
          if (existingJV.lastRadioQuestion != null)
            existingJV.lastRadioQuestion = journeyVisitor.lastRadioQuestion
          if (existingJV.lastRadioOptionSubmission != null)
            existingJV.lastRadioOptionSubmission =
              journeyVisitor.lastRadioOptionSubmission
          if (existingJV.activityCount < journeyVisitor.activityCount)
            existingJV.activityCount = journeyVisitor.activityCount
          if (existingJV.updatedAt < journeyVisitor.updatedAt)
            existingJV.updatedAt = journeyVisitor.updatedAt

          await prisma.journeyVisitor.update({
            where: { id: existingJV.id },
            data: omit(existingJV, ['id'])
          })

          await prisma.event.updateMany({
            where: { journeyVisitor: { id: journeyVisitor.id } },
            data: {
              visitorId: newInitial.id,
              journeyVisitorVisitorId: newInitial.id
            }
          })
        }
        await prisma.journeyVisitor.delete({ where: { id: journeyVisitor.id } })
      }
      await prisma.event.updateMany({
        where: { visitorId: nextVisitor.id },
        data: { visitorId: newInitial.id }
      })
      await prisma.visitor.delete({ where: { id: nextVisitor.id } })
      console.log('journeyVisitors:', journeyVisitors.length)
      handledIds.push(nextVisitor.id)
    }
    handledIds.push(newInitial.id)
    console.log('new value:', newInitial)
  }
}
