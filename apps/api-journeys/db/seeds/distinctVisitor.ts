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

      handledIds.push(nextVisitor.id)
    }
    handledIds.push(newInitial.id)
    console.log('new value:', newInitial)
  }
}
