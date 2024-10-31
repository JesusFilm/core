import { Prisma } from '.prisma/api-journeys-modern-client'

export enum UserJourneyRole {
  editor = 'editor',
  inviteRequested = 'inviteRequested',
  owner = 'owner'
}
export interface JourneyForEmails {
  id: string
  slug: string
  title: string
  primaryImageBlock: {
    id: string
    parentBlockId: string | null
    parentOrder: number | null
    src: string | null
    alt: string
    width: number
    height: number
    blurhash: string
  }
  userJourneys: {
    id: string
    role: UserJourneyRole
    user: {
      id: string
      firstName: string
      lastName: string | null
      imageUrl: string | null
    }
  }
  team: {
    id: string
    title: string
    publicTitle: string | null
  }
}

export type Journey = Prisma.JourneyGetPayload<{
  include: {
    userJourneys: true
    team: true
    primaryImageBlock: true
  }
}>
