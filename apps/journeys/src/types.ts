export type TypeName = 'RadioOption' | 'RadioQuestion' | 'Step' | 'Video'
interface BaseBlockType {
  id: string
  parent?: {
    id: string
  }
  children?: BlockType[]
  action?: string
  __typename: TypeName
}

export type RadioOptionType = BaseBlockType & {
  __typename: 'RadioOption'
  label: string
  image?: string
}

export type RadioQuestionType = BaseBlockType & {
  __typename: 'RadioQuestion'
  label: string
  description?: string
  variant?: 'light' | 'dark'
}

export type StepType = BaseBlockType & {
  __typename: 'Step'
}

export type VideoType = BaseBlockType & {
  __typename: 'Video'
  sources: [ {
    src: string
  } ]
  poster?: string
}

export type BlockType = RadioOptionType | StepType | VideoType | RadioQuestionType

export type NextStepProps = (id?: string) => void
export interface GoTo {
  goTo: NextStepProps
}
export interface ConductorProps {
  blocks: BlockType[]
}
