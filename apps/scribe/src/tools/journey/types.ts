export interface JourneySimpleButton {
  text: string
  nextCard?: string
  url?: string
}

export interface JourneySimplePollOption {
  text: string
  nextCard?: string
  url?: string
}

export interface JourneySimpleImage {
  src: string
  alt: string
  width: number
  height: number
  blurhash: string
}

export interface JourneySimpleVideo {
  url: string
  startAt?: number
  endAt?: number
}

export interface JourneySimpleCard {
  id: string
  x: number
  y: number
  heading?: string
  text?: string
  button?: JourneySimpleButton
  poll?: JourneySimplePollOption[]
  image?: JourneySimpleImage
  backgroundImage?: JourneySimpleImage
  video?: JourneySimpleVideo
  defaultNextCard?: string
}

export interface JourneySimple {
  title: string
  description: string
  cards: JourneySimpleCard[]
}

export type IssueSeverity = 'error' | 'warning'

export type IssueCode =
  | 'E001'
  | 'E002'
  | 'E003'
  | 'E004'
  | 'E005'
  | 'E006'
  | 'E007'
  | 'E008'
  | 'W101'
  | 'W102'
  | 'W103'
  | 'W104'

export interface JourneyIssue {
  id: string
  severity: IssueSeverity
  code: IssueCode
  cardId?: string
  message: string
}

export interface JourneyValidationResult {
  summary: {
    errorCount: number
    warningCount: number
    totalCards: number
    entryCardId: string | null
  }
  issues: JourneyIssue[]
}
