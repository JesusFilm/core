
export type TypeName = 'RadioOption' | 'RadioQuestion' | 'Step' | 'Video' | 'VideoOverlay'
interface BaseBlockType {
  id: string
  parent?: {
    id: string
  }
  children?: BlockType[]
  action?: Action
  __typename: TypeName
}

export type Action = NavigateAction | NavigateToJourneyAction | LinkAction

export interface NavigateAction {
  __typename: 'NavigateAction'
  blockId?: string // must be root block else goes to next block
}

export interface NavigateToJourneyAction {
  __typename: 'NavigateToJourneyAction'
  journeyId: string
}

export interface LinkAction {
  __typename: 'LinkAction'
  url: string
  target?: '_blank'
}

export interface RadioOptionType extends BaseBlockType {
  __typename: 'RadioOption'
  label: string
  image?: string
}

export type VideoEvent = 'ready' | 'paused' | 'timeReached' | 'ended'
export interface VideoOverlayType extends BaseBlockType {
  __typename: 'VideoOverlay'
  displayOn: VideoEvent[]
}

export interface RadioQuestionType extends BaseBlockType {
  __typename: 'RadioQuestion'
  label: string
  description?: string
  variant?: 'light' | 'dark'
}

export interface StepType extends BaseBlockType {
  __typename: 'Step'
}

export interface VideoType extends BaseBlockType {
  __typename: 'Video'
  sources: [{
    src: string
  }]
  poster?: string
}

export type OnTimeReachedType = BaseBlockType & {
  __typename: 'OnTimeReached'
  secondsWatched: number
}

export type OnVideoPausedType = BaseBlockType & {
  __typename: 'OnVideoPaused'
}

export type BlockType = RadioOptionType | StepType | VideoType | RadioQuestionType | VideoOverlayType

export type NextStepProps = (id?: string) => void
export interface GoTo {
  goTo: NextStepProps
}
export interface ConductorProps {
  blocks: BlockType[]
}
